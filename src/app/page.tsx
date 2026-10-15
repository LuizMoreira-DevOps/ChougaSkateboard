import { Header } from "../components/Header/Header";
import { Hero } from "../components/Hero/Hero";
import { FeaturedProducts } from "../components/FeaturedProducts/FeaturedProducts";
import { Footer } from "../components/Footer/Footer";

import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <Hero />

                <FeaturedProducts />
            </main>

            <Footer />
        </div>
    );
}
