<template>
    <header>
        <div class="brand">
            Pokenat Organizer
        </div>
    </header>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class Header extends Vue {
    
}
</script>

<style lang="scss">

header {
    @apply w-full; // relative w-full z-10 fixed top-0
    @apply text-white font-bold py-1 h-12;
    @apply bg-red-600 border-b border-gray-200;
    @apply flex justify-center items-center;
}

</style>