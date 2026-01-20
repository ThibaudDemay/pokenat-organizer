<template>
    <Teleport to="body">
        <Transition name="drawer">
            <div v-if="isOpen" class="drawer-overlay" @click="handleOverlayClick">
                <div
                    class="drawer-content"
                    @click.stop
                    ref="drawerRef"
                >
                    <div
                        class="drawer-handle"
                        @click="close"
                        @touchstart.prevent="handleTouchStart"
                        @touchmove.prevent="handleTouchMove"
                        @touchend="handleTouchEnd"
                    >
                        <div class="handle-bar"></div>
                    </div>
                    <div class="drawer-body">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    'close': [];
}>();

const drawerRef = ref<HTMLElement | null>(null);
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isDragging = ref(false);

function close() {
    emit('close');
}

function handleOverlayClick() {
    close();
}

function handleTouchStart(e: TouchEvent) {
    touchStartY.value = e.touches[0].clientY;
    isDragging.value = true;
}

function handleTouchMove(e: TouchEvent) {
    if (!isDragging.value) return;
    touchCurrentY.value = e.touches[0].clientY;
    const delta = touchCurrentY.value - touchStartY.value;

    // Seulement permettre le drag vers le bas
    if (delta > 0 && drawerRef.value) {
        drawerRef.value.style.transform = `translateY(${delta}px)`;
    }
}

function handleTouchEnd() {
    if (!isDragging.value) return;
    isDragging.value = false;

    const delta = touchCurrentY.value - touchStartY.value;

    // Si drag > 100px, fermer le drawer
    if (delta > 100) {
        close();
    }

    // Reset transform
    if (drawerRef.value) {
        drawerRef.value.style.transform = '';
    }
}
</script>

<style lang="scss">
.drawer-overlay {
    @apply fixed inset-0 z-50;
    @apply bg-black bg-opacity-50;
    @apply flex items-end justify-center;
}

.drawer-content {
    @apply w-full max-h-[85vh];
    @apply bg-white dark:bg-gray-800;
    @apply rounded-t-2xl;
    @apply flex flex-col;
    @apply overflow-hidden;
    @apply transition-transform duration-200;

    // Safe area pour le bas
    padding-bottom: env(safe-area-inset-bottom);
}

.drawer-handle {
    @apply flex-shrink-0 py-3 cursor-pointer;
    @apply flex justify-center;
    touch-action: none; // Empêche le pull-to-refresh sur le handle

    .handle-bar {
        @apply w-10 h-1 rounded-full;
        @apply bg-gray-300 dark:bg-gray-600;
    }
}

.drawer-body {
    @apply flex-1 overflow-y-auto px-4 pb-4;
}

// Transitions
.drawer-enter-active,
.drawer-leave-active {
    transition: opacity 0.3s ease;

    .drawer-content {
        transition: transform 0.3s ease;
    }
}

.drawer-enter-from,
.drawer-leave-to {
    opacity: 0;

    .drawer-content {
        transform: translateY(100%);
    }
}
</style>
