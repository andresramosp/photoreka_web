import { reactive, ref } from "vue";
import Konva from "konva";
import { useCanvasStore } from "@/stores/canvas";
import { TOOLBAR_WIDTH } from "./useCanvasStage";

export function useCanvasPhoto(stageRef, photos, photoRefs, stageConfig) {
  const dragGroupStart = reactive({});
  const hoverTimeouts = reactive({});
  const canvasStore = useCanvasStore();

  const isHoveringTrash = ref(false);

  const handleSelectPhoto = (photo, event) => {
    if (!selectionRectVisible()) {
      photo.selected = !photo.selected;
      const node = photoRefs.value[photo.id]?.getNode();
      if (node) {
        node.moveToTop();
        node.getLayer().batchDraw();
      }
    }
  };

  const selectionRectVisible = () => false;

  const handleDragStart = (photo, e) => {
    e.cancelBubble = true;

    // 1) Lleva primero cualquier selección previa (opcional si solo arrastras uno)
    photos.value
      .filter((p) => p.selected && p.id !== photo.id)
      .forEach((p) => photoRefs.value[p.id]?.getNode().moveToTop());

    // 2) Mueve el que estás arrastrando al top *al final* para que esté siempre por encima
    const node = photoRefs.value[photo.id]?.getNode();
    if (node) {
      node.moveToTop();
      node.getLayer().batchDraw();
    }

    // 3) Luego tu lógica de arrastre (almacenar posiciones, etc.)
    Object.keys(dragGroupStart).forEach((k) => delete dragGroupStart[k]);
    if (photo.selected) {
      photos.value.forEach((p) => {
        if (p.selected) {
          dragGroupStart[p.id] = { x: p.config.x, y: p.config.y };
        }
      });
    } else {
      dragGroupStart[photo.id] = { x: photo.config.x, y: photo.config.y };
    }
  };

  const handleDragMove = (photo, e) => {
    const newX = e.target.x();
    const newY = e.target.y();
    const origin = dragGroupStart[photo.id];
    const deltaX = newX - origin.x;
    const deltaY = newY - origin.y;

    if (photo.selected) {
      photos.value.forEach((p) => {
        if (p.selected && dragGroupStart[p.id]) {
          p.config.x = dragGroupStart[p.id].x + deltaX;
          p.config.y = dragGroupStart[p.id].y + deltaY;
        }
      });
    } else {
      photo.config.x = newX;
      photo.config.y = newY;
    }

    const anyInTrash = photo.selected
      ? photos.value.some((p) => p.selected && isInTrashZone(p))
      : isInTrashZone(photo);

    isHoveringTrash.value = anyInTrash;

    photos.value.forEach((p) => {
      if (photo.selected) {
        p.inTrash = p.selected && anyInTrash;
      } else {
        p.inTrash = p.id === photo.id && anyInTrash;
      }
    });
  };

  function isInTrashZone(photo) {
    const trashEl = document.querySelector(".trash-zone");
    if (!trashEl) return false;

    const trashRect = trashEl.getBoundingClientRect();

    // Expandimos la zona virtual de la papelera
    const margin = 30; // píxeles extra de margen de detección

    const expandedRect = {
      left: trashRect.left - margin,
      right: trashRect.right + margin,
      top: trashRect.top - margin,
      bottom: trashRect.bottom + margin,
    };

    const stage = stageRef.value.getStage();
    const { x, y, width, height } = photo.config;
    const centerKonva = { x: x + width / 2, y: y + height / 2 };
    const centerScreen = stage.getAbsoluteTransform().point(centerKonva);

    const containerRect = stage.container().getBoundingClientRect();
    const screenX = containerRect.left + centerScreen.x;
    const screenY = containerRect.top + centerScreen.y;

    return (
      screenX >= expandedRect.left &&
      screenX <= expandedRect.right &&
      screenY >= expandedRect.top &&
      screenY <= expandedRect.bottom
    );
  }

  const SNAP_THRESHOLD = 120;
  const MIN_SEPARATION = 35;
  const MIN_SEPARATION_APPLY_THRESHOLD = 80; // nuevo umbral para activar corrección

  const handleDragEnd = (photo, evt, enableSnap = true) => {
    const node = evt.target;
    const newPos = node.position();
    photo.config.x = newPos.x;
    photo.config.y = newPos.y;

    if (enableSnap) {
      const others = photos.value.filter((p) => p.id !== photo.id);
      if (others.length) {
        for (const p of others) {
          const ax1 = photo.config.x;
          const ay1 = photo.config.y;
          const ax2 = ax1 + photo.config.width;
          const ay2 = ay1 + photo.config.height;

          const bx1 = p.config.x;
          const by1 = p.config.y;
          const bx2 = bx1 + p.config.width;
          const by2 = by1 + p.config.height;

          const overlapX = Math.min(ax2, bx2) - Math.max(ax1, bx1);
          const overlapY = Math.min(ay2, by2) - Math.max(ay1, by1);

          if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
              if (ax1 < bx1) {
                photo.config.x = bx1 - photo.config.width - MIN_SEPARATION;
              } else {
                photo.config.x = bx2 + MIN_SEPARATION;
              }
              node.x(photo.config.x);
            } else {
              if (ay1 < by1) {
                photo.config.y = by1 - photo.config.height - MIN_SEPARATION;
              } else {
                photo.config.y = by2 + MIN_SEPARATION;
              }
              node.y(photo.config.y);
            }
          } else {
            const gapX = Math.max(bx1 - ax2, ax1 - bx2);
            const gapY = Math.max(by1 - ay2, ay1 - by2);

            if (gapX >= 0 && gapX < MIN_SEPARATION_APPLY_THRESHOLD) {
              if (ax1 < bx1) {
                photo.config.x = bx1 - photo.config.width - MIN_SEPARATION;
              } else {
                photo.config.x = bx2 + MIN_SEPARATION;
              }
              node.x(photo.config.x);
            }

            if (gapY >= 0 && gapY < MIN_SEPARATION_APPLY_THRESHOLD) {
              if (ay1 < by1) {
                photo.config.y = by1 - photo.config.height - MIN_SEPARATION;
              } else {
                photo.config.y = by2 + MIN_SEPARATION;
              }
              node.y(photo.config.y);
            }
          }
        }

        // --- SNAP ---
        let closestX = { dist: Infinity, value: null };
        let closestY = { dist: Infinity, value: null };

        for (const p of others) {
          const dx = Math.abs(p.config.x - photo.config.x);
          const dy = Math.abs(p.config.y - photo.config.y);

          if (dx < closestX.dist) closestX = { dist: dx, value: p.config.x };
          if (dy < closestY.dist) closestY = { dist: dy, value: p.config.y };
        }

        if (closestX.dist < SNAP_THRESHOLD || closestY.dist < SNAP_THRESHOLD) {
          if (
            closestX.dist <= closestY.dist &&
            closestX.dist < SNAP_THRESHOLD
          ) {
            photo.config.x = closestX.value;
            node.x(photo.config.x);
          } else if (closestY.dist < SNAP_THRESHOLD) {
            photo.config.y = closestY.value;
            node.y(photo.config.y);
          }
        }
      }
    }

    // --- BASURA ---
    let photosToRemove = [];
    if (photo.selected) {
      const selected = photos.value.filter((p) => p.selected);
      if (selected.some((p) => isInTrashZone(p))) photosToRemove = selected;
    } else if (isInTrashZone(photo)) {
      photosToRemove = [photo];
    }

    if (photosToRemove.length) {
      canvasStore.deletePhotos(photosToRemove.map((p) => p.id));
      isHoveringTrash.value = false;
    }
  };

  const handleMouseOver = (photo) => {
    // Cancelar su propio timeout si estaba en curso
    if (hoverTimeouts[photo.id]) {
      clearTimeout(hoverTimeouts[photo.id]);
      hoverTimeouts[photo.id] = null;
    }

    // Desactivar hovered en otras fotos (y cancelar sus timeouts)
    photos.value.forEach((p) => {
      if (p.id !== photo.id) {
        if (hoverTimeouts[p.id]) {
          clearTimeout(hoverTimeouts[p.id]);
          hoverTimeouts[p.id] = null;
        }
        if (p.hovered) {
          p.hovered = false;
        }
      }
    });

    // Activar hovered en esta foto
    photo.hovered = true;
  };

  const handleMouseOut = (photo) => {
    // Si ya hay un timeout, lo cancelamos por seguridad
    if (hoverTimeouts[photo.id]) clearTimeout(hoverTimeouts[photo.id]);

    // Programamos desactivar hovered después del delay
    hoverTimeouts[photo.id] = setTimeout(() => {
      photo.hovered = false;
      hoverTimeouts[photo.id] = null;
    }, 250); // o el tiempo que quieras
  };

  const autoAlignPhotos = () => {
    const threshold = 50; // cuánto margen permitimos para decir que están "casi alineados"
    for (let i = 0; i < photos.value.length; i++) {
      for (let j = i + 1; j < photos.value.length; j++) {
        const photoA = photos.value[i];
        const photoB = photos.value[j];

        const dx = Math.abs(photoA.config.x - photoB.config.x);
        const dy = Math.abs(photoA.config.y - photoB.config.y);

        if (dx < threshold) {
          // Alinear verticalmente
          const targetX = Math.round((photoA.config.x + photoB.config.x) / 2);
          movePhotoSmoothly(photoA, targetX, photoA.config.y);
          movePhotoSmoothly(photoB, targetX, photoB.config.y);
        }

        if (dy < threshold) {
          // Alinear horizontalmente
          const targetY = Math.round((photoA.config.y + photoB.config.y) / 2);
          movePhotoSmoothly(photoA, photoA.config.x, targetY);
          movePhotoSmoothly(photoB, photoB.config.x, targetY);
        }
      }
    }
  };

  const movePhotoSmoothly = (photo, targetX, targetY) => {
    if (!photoRefs.value[photo.id]) return;
    const node = photoRefs.value[photo.id].getNode();
    new Konva.Tween({
      node,
      duration: 0.5,
      x: targetX,
      y: targetY,
      easing: Konva.Easings.StrongEaseInOut,
    }).play();
    photo.config.x = targetX;
    photo.config.y = targetY;
  };

  const bringPhotosToFront = (photoList) => {
    photoList.forEach((photo) => {
      const node = photoRefs.value[photo.id]?.getNode();
      if (node) node.moveToTop();
    });
    const anyNode = photoRefs.value[photoList[0]?.id]?.getNode();
    if (anyNode) anyNode.getLayer().batchDraw();
  };

  return {
    handleSelectPhoto,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleMouseOver,
    handleMouseOut,
    autoAlignPhotos,
    isHoveringTrash,
  };
}
