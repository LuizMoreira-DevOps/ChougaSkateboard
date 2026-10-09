import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <div className={styles.footerBrand}>
                    <span className={styles.footerBrandName}>CHOUGA</span>
                    <span className={styles.footerBrandDescriptor}>
                        Skateboard
                    </span>
                </div>

                <nav
                    className={styles.footerNav}
                    aria-label="Navegação complementar"
                >
                    <Link href="/#loja">Loja</Link>
                    <Link href="/#cultura">Cultura</Link>
                    <Link href="/#wheels">Wheels</Link>
                </nav>
            </div>

            <div className={styles.footerBottom}>
                <p>Skate · Streetwear · Cultura</p>

                <div className={styles.footerMeta}>
                    <span>Curitiba / BR</span>
                    <span aria-hidden="true">041</span>
                </div>
            </div>
        </footer>
    );
}
