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

  // Configuración de movimiento simple: velocidad inicial + aceleración
  const moveSpeed = ref(1.2); // velocidad máxima
  const initialSpeed = ref(0.01); // velocidad inicial baja
  const accelerationRate = ref(4.0); // aceleración constante

  // Vectores de dirección
  const direction = new THREE.Vector3();
  const sideways = new THREE.Vector3();
  const upward = new THREE.Vector3(0, 1, 0);

  // Para suavizar el movimiento con aceleración
  const velocity = new THREE.Vector3();
  const damping = 0.1;

  // Sistema de aceleración progresiva
  const currentSpeeds = ref({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0,
  });

  // Tiempo para tracking de aceleración
  let lastUpdateTime = performance.now();

  // Estado de habilitación de controles
  const enabled = ref(true);

  // Eventos de teclado
  const onKeyDown = (event) => {
    if (!enabled.value) return; // Bloquear si está deshabilitado

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
      case "KeyF":
        keys.value.up = true;
        break;
      case "KeyV":
        keys.value.down = true;
        break;
    }
  };

  const onKeyUp = (event) => {
    if (!enabled.value) {
      // Forzar todas las teclas a false si está deshabilitado
      Object.keys(keys.value).forEach((key) => (keys.value[key] = false));
      return;
    }

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
      case "KeyF":
        keys.value.up = false;
        break;
      case "KeyV":
        keys.value.down = false;
        break;
    }
  };

  // Eventos del mouse para rotación libre
  const onMouseMove = (event) => {
    if (!mouseState.value.isPointerLocked || !enabled.value) return;

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
    if (!enabled.value) {
      console.log("⚠️ Controles deshabilitados - pointer lock bloqueado");
      return;
    }
    if (domElement.requestPointerLock) {
      domElement.requestPointerLock();
    }
  };

  // Función de actualización del frame con aceleración progresiva
  const update = (deltaTime = 0.016) => {
    // Calcular vectores de dirección basados en la orientación actual de la cámara
    camera.getWorldDirection(direction);
    sideways.crossVectors(direction, upward).normalize();

    // Calcular deltaTime real si no se proporciona
    const currentTime = performance.now();
    const actualDeltaTime = (currentTime - lastUpdateTime) / 1000; // Convertir a segundos
    lastUpdateTime = currentTime;

    // Usar el deltaTime proporcionado o el calculado
    const dt = deltaTime > 0.1 ? actualDeltaTime : deltaTime;

    // Resetear velocidad
    velocity.set(0, 0, 0);

    // Sistema simple: velocidad inicial + aceleración constante
    const maxSpeed = moveSpeed.value;

    // Actualizar velocidades para cada dirección con fórmula limpia
    const directions = ["forward", "backward", "left", "right", "up", "down"];

    directions.forEach((dir) => {
      if (keys.value[dir]) {
        // Si no se está moviendo, empezar con velocidad inicial baja
        if (currentSpeeds.value[dir] === 0) {
          currentSpeeds.value[dir] = initialSpeed.value;
        } else {
          // Acelerar linealmente hasta velocidad máxima
          currentSpeeds.value[dir] = Math.min(
            maxSpeed,
            currentSpeeds.value[dir] + accelerationRate.value * dt
          );
        }
      } else {
        // Resetear velocidad al soltar tecla
        currentSpeeds.value[dir] = 0;
      }
    });

    // Aplicar movimiento basado en las velocidades actuales
    if (keys.value.forward && currentSpeeds.value.forward > 0) {
      velocity.addScaledVector(direction, currentSpeeds.value.forward);
    }
    if (keys.value.backward && currentSpeeds.value.backward > 0) {
      velocity.addScaledVector(direction, -currentSpeeds.value.backward);
    }
    if (keys.value.left && currentSpeeds.value.left > 0) {
      velocity.addScaledVector(sideways, -currentSpeeds.value.left);
    }
    if (keys.value.right && currentSpeeds.value.right > 0) {
      velocity.addScaledVector(sideways, currentSpeeds.value.right);
    }
    if (keys.value.up && currentSpeeds.value.up > 0) {
      velocity.addScaledVector(upward, currentSpeeds.value.up);
    }
    if (keys.value.down && currentSpeeds.value.down > 0) {
      velocity.addScaledVector(upward, -currentSpeeds.value.down);
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

  const setInitialSpeed = (speed) => {
    initialSpeed.value = speed;
  };

  const setAccelerationRate = (rate) => {
    accelerationRate.value = rate;
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

  // Método para resetear velocidades (útil cuando se pausa/reanuda)
  const resetSpeeds = () => {
    Object.keys(currentSpeeds.value).forEach((key) => {
      currentSpeeds.value[key] = 0;
    });
  };

  // Métodos para habilitar/deshabilitar controles
  const enable = () => {
    enabled.value = true;
    console.log("🚀 Controles FPS habilitados");
  };

  const disable = () => {
    enabled.value = false;
    // Resetear todas las teclas y velocidades
    Object.keys(keys.value).forEach((key) => (keys.value[key] = false));
    resetSpeeds();
    console.log("🔒 Controles FPS deshabilitados");
  };

  return {
    // Estado reactivo
    keys,
    mouseState,
    moveSpeed,
    initialSpeed,
    accelerationRate,
    currentSpeeds,
    enabled,

    // Métodos
    setup,
    cleanup,
    update,
    setMoveSpeed,
    setMouseSensitivity,
    setInitialSpeed,
    setAccelerationRate,
    setCameraPosition,
    setCameraRotation,
    resetSpeeds,
    requestPointerLock,
    enable,
    disable,
  };
}
