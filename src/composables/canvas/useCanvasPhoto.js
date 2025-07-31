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

      // SOLUCIÓN: Reorganizar todo el array de fotos para cambiar el orden de pintado
      // La foto clickeada se mueve al final del array, lo que la hace aparecer encima
      reorganizePhotosOrder(photo.id);
    }
  };

  // Función para reorganizar el orden de las fotos en el array
  const reorganizePhotosOrder = (clickedPhotoId) => {
    const currentPhotos = [...photos.value];

    // Encontrar la foto clickeada
    const clickedPhotoIndex = currentPhotos.findIndex(
      (p) => p.id === clickedPhotoId
    );
    if (clickedPhotoIndex === -1) return;

    // Remover la foto clickeada de su posición actual
    const clickedPhoto = currentPhotos.splice(clickedPhotoIndex, 1)[0];

    // Si hay fotos seleccionadas, también las movemos al final (pero antes que la clickeada)
    const selectedPhotos = [];
    for (let i = currentPhotos.length - 1; i >= 0; i--) {
      if (currentPhotos[i].selected && currentPhotos[i].id !== clickedPhotoId) {
        selectedPhotos.unshift(currentPhotos.splice(i, 1)[0]);
      }
    }

    // Reorganizar: fotos no seleccionadas + fotos seleccionadas + foto clickeada
    const newPhotosOrder = [...currentPhotos, ...selectedPhotos, clickedPhoto];

    // Actualizar el store - esto forzará un re-render completo del canvas
    canvasStore.photos = newPhotosOrder;
  };

  const selectionRectVisible = () => false;

  const handleDragStart = (photo, e) => {
    e.cancelBubble = true;

    // SOLUCIÓN: Reorganizar el orden de las fotos ANTES de que comience el drag
    // Esto asegura que la foto arrastrada esté al final del array (encima de todas)
    reorganizePhotosOrder(photo.id);

    // Esperar un frame para que se complete el re-render antes de iniciar el drag
    setTimeout(() => {
      // Lógica normal de arrastre
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
    }, 0);
  };

  const handleDragMove = (photo, e) => {
    const newX = e.target.x();
    const newY = e.target.y();
    const origin = dragGroupStart[photo.id];

    // Validar que origin existe para evitar errores
    if (!origin) {
      // Si no existe origin, inicializarlo con la posición actual
      dragGroupStart[photo.id] = { x: photo.config.x, y: photo.config.y };
      return; // Salir y esperar al siguiente evento de drag
    }

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

  const handleDragEnd = (photo, evt, enableSnap = true) => {
    const node = evt.target;
    // Actualizar posición de la foto
    const newPos = node.position();
    photo.config.x = newPos.x;
    photo.config.y = newPos.y;

    if (enableSnap) {
      const MAX_DIST = 300; // distancia máxima para snap
      const others = photos.value.filter((p) => p.id !== photo.id);
      if (others.length) {
        let closest = null;
        let minDist = Infinity;
        // Encontrar la foto más cercana
        for (const p of others) {
          const dx = photo.config.x - p.config.x;
          const dy = photo.config.y - p.config.y;
          const dist = Math.hypot(dx, dy);
          if (dist < minDist) {
            minDist = dist;
            closest = p;
          }
        }

        // Solo alinear si la más cercana está dentro de MAX_DIST
        if (closest && minDist <= MAX_DIST) {
          // Determinar eje de alineación según posición relativa
          const dx = closest.config.x - photo.config.x;
          const dy = closest.config.y - photo.config.y;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          const MIN_GAP = 35; // separación mínima

          if (absDy > absDx) {
            // Alinear verticalmente (coincidir X)
            photo.config.x = closest.config.x;
            node.x(photo.config.x);
            // Ajustar Y para mantener separación mínima
            if (dy > 0) {
              // closest está debajo
              photo.config.y = closest.config.y - photo.config.height - MIN_GAP;
            } else {
              // closest está encima
              photo.config.y =
                closest.config.y + closest.config.height + MIN_GAP;
            }
            node.y(photo.config.y);
          } else {
            // Alinear horizontalmente (coincidir Y)
            photo.config.y = closest.config.y;
            node.y(photo.config.y);
            // Ajustar X para mantener separación mínima
            if (dx > 0) {
              // closest a la derecha
              photo.config.x = closest.config.x - photo.config.width - MIN_GAP;
            } else {
              // closest a la izquierda
              photo.config.x =
                closest.config.x + closest.config.width + MIN_GAP;
            }
            node.x(photo.config.x);
          }
        }
      }
    }

    // --- BASURA (trash) logic ---
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

  function handlePhotoDrop(event, removePhotoFromToolbar) {
    event.preventDefault();

    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;

    const droppedPhotos = JSON.parse(raw);
    if (!Array.isArray(droppedPhotos) || droppedPhotos.length === 0) return;

    const stage = stageRef.value.getStage();
    const containerRect = stage.container().getBoundingClientRect();
    const transform = stage.getAbsoluteTransform().copy().invert();

    const pointer = {
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
    };

    const stagePoint = transform.point(pointer);

    const defaultWidth = 200;
    const defaultHeight = 140;
    const spreadOffset = 30; // distancia entre cada foto

    droppedPhotos.forEach((photo, index) => {
      const width = photo.config?.width || defaultWidth;
      const height = photo.config?.height || defaultHeight;

      const offsetX = spreadOffset * index;
      const offsetY = spreadOffset * index;

      photo.config = {
        x: stagePoint.x - width / 2 + offsetX,
        y: stagePoint.y - height / 2 + offsetY,
        width,
        height,
      };

      canvasStore.addPhotos([photo]);
      removePhotoFromToolbar(photo.id);
    });
  }

  return {
    handleSelectPhoto,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleMouseOver,
    handleMouseOut,
    autoAlignPhotos,
    isHoveringTrash,
    handlePhotoDrop,
    reorganizePhotosOrder,
  };
}
