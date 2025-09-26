import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

export function useFirstPersonControls(camera, domElement) {
  // Estado de las teclas
  const keys = ref({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Estados del mouse
  const mouseState = ref({
    isPointerLocked: false,
    sensitivity: 0.003,
    yaw: 0, // rotación horizontal
    pitch: 0, // rotación vertical
  });

  // Configuración de movimiento
  const moveSpeed = ref(0.8); // velocidad constante
  const fastMoveSpeed = ref(2.0); // velocidad rápida con Shift

  // Vectores de dirección
  const direction = new THREE.Vector3();
  const sideways = new THREE.Vector3();
  const upward = new THREE.Vector3(0, 1, 0);

  // Para suavizar el movimiento
  const velocity = new THREE.Vector3();
  const damping = 0.1;

  // Eventos de teclado
  const onKeyDown = (event) => {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        keys.value.forward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        keys.value.backward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        keys.value.left = true;
        break;
      case "KeyD":
      case "ArrowRight":
        keys.value.right = true;
        break;
      case "KeyQ":
      case "Space":
        keys.value.up = true;
        event.preventDefault(); // Evitar scroll con Space
        break;
      case "KeyE":
      case "ShiftLeft":
      case "ShiftRight":
        keys.value.down = true;
        break;
    }
  };

  const onKeyUp = (event) => {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        keys.value.forward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        keys.value.backward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        keys.value.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        keys.value.right = false;
        break;
      case "KeyQ":
      case "Space":
        keys.value.up = false;
        break;
      case "KeyE":
      case "ShiftLeft":
      case "ShiftRight":
        keys.value.down = false;
        break;
    }
  };

  // Eventos del mouse para rotación libre
  const onMouseMove = (event) => {
    if (!mouseState.value.isPointerLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    mouseState.value.yaw -= movementX * mouseState.value.sensitivity;
    mouseState.value.pitch -= movementY * mouseState.value.sensitivity;

    // Limitar pitch para evitar voltear completamente
    mouseState.value.pitch = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, mouseState.value.pitch)
    );

    // Aplicar rotación a la cámara
    camera.rotation.order = "YXZ";
    camera.rotation.y = mouseState.value.yaw;
    camera.rotation.x = mouseState.value.pitch;
  };

  // Eventos del mouse para zoom con rueda
  const onWheel = (event) => {
    event.preventDefault();

    // Calcular dirección hacia adelante basada en la orientación actual de la cámara
    camera.getWorldDirection(direction);

    // Velocidad constante independiente de la distancia
    const speed = event.deltaY > 0 ? -moveSpeed.value : moveSpeed.value;

    // Mover en la dirección de la cámara
    camera.position.addScaledVector(direction, speed);
  };

  // Control de Pointer Lock
  const onPointerLockChange = () => {
    mouseState.value.isPointerLocked =
      document.pointerLockElement === domElement;
  };

  const onPointerLockError = () => {
    console.error("Pointer lock error");
  };

  // Solicitar Pointer Lock al hacer click
  const requestPointerLock = () => {
    if (domElement.requestPointerLock) {
      domElement.requestPointerLock();
    }
  };

  // Función de actualización del frame
  const update = (deltaTime = 0.016) => {
    // Calcular vectores de dirección basados en la orientación actual de la cámara
    camera.getWorldDirection(direction);
    sideways.crossVectors(direction, upward).normalize();

    // Resetear velocidad
    velocity.set(0, 0, 0);

    // Determinar velocidad actual (rápida con Shift)
    const currentSpeed = keys.value.down
      ? fastMoveSpeed.value
      : moveSpeed.value;

    // Calcular movimiento basado en las teclas presionadas
    if (keys.value.forward) {
      velocity.addScaledVector(direction, currentSpeed);
    }
    if (keys.value.backward) {
      velocity.addScaledVector(direction, -currentSpeed);
    }
    if (keys.value.left) {
      velocity.addScaledVector(sideways, -currentSpeed);
    }
    if (keys.value.right) {
      velocity.addScaledVector(sideways, currentSpeed);
    }
    if (keys.value.up) {
      velocity.addScaledVector(upward, currentSpeed);
    }

    // Aplicar movimiento a la cámara
    camera.position.add(velocity);
  };

  // Configuración inicial
  const setup = () => {
    if (!camera || !domElement) {
      console.error("Camera or domElement not provided");
      return;
    }

    // Configuración inicial de la cámara
    camera.rotation.order = "YXZ";

    // Event listeners
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("pointerlockerror", onPointerLockError);

    if (domElement) {
      domElement.addEventListener("click", requestPointerLock);
      domElement.addEventListener("mousemove", onMouseMove);
      domElement.addEventListener("wheel", onWheel, { passive: false });
    }
  };

  // Limpieza de eventos
  const cleanup = () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    document.removeEventListener("pointerlockchange", onPointerLockChange);
    document.removeEventListener("pointerlockerror", onPointerLockError);

    if (domElement) {
      domElement.removeEventListener("click", requestPointerLock);
      domElement.removeEventListener("mousemove", onMouseMove);
      domElement.removeEventListener("wheel", onWheel);
    }
  };

  // Métodos públicos para configuración
  const setMoveSpeed = (speed) => {
    moveSpeed.value = speed;
  };

  const setMouseSensitivity = (sensitivity) => {
    mouseState.value.sensitivity = sensitivity;
  };

  const setCameraPosition = (x, y, z) => {
    camera.position.set(x, y, z);
  };

  const setCameraRotation = (yaw, pitch) => {
    mouseState.value.yaw = yaw;
    mouseState.value.pitch = pitch;
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  };

  return {
    // Estado reactivo
    keys,
    mouseState,
    moveSpeed,

    // Métodos
    setup,
    cleanup,
    update,
    setMoveSpeed,
    setMouseSensitivity,
    setCameraPosition,
    setCameraRotation,
    requestPointerLock,
  };
}
