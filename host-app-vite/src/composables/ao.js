import { onMounted } from "vue"
import AOS from "aos"
import 'aos/dist/aos.css'

export function useAOS() {
    onMounted(() => {
        AOS.init();
    });
}