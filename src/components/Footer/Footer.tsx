import Link from "next/link";
import Image from "next/image";
import logoChouga from "./assets/logo-chouga-white.svg";
import styles from "./Footer.module.css";

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <div className={styles.footerBrand}>
                    <Image
                        src={logoChouga}
                        alt="Chouga Skateboard"
                        className={styles.footerLogo}
                    />
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
                <p>Skate · Streetwear · Cultura · Família </p>

                <div className={styles.footerMeta}>
                    <span>Curitiba / BR</span>
                    <span className={styles.footerStamp} aria-hidden="true">
                        041
                    </span>
                </div>
            </div>
        </footer>
    );
}
