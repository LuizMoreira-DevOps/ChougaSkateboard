import Link from "next/link";
import Image from "next/image";

import { CartDrawer } from "../CartDrawer/CartDrawer";

import logoChouga from "./assets/logo-chouga-black.svg";
import styles from "./Header.module.css";

export function Header() {
    return (
        <header className={styles.header}>
            <Link
                className={styles.brand}
                href="/"
                aria-label="Chouga Skateboard - página inicial"
            >
                <Image
                    src={logoChouga}
                    alt="Logo Chouga Skateboard"
                    className={styles.brandLogo}
                />
            </Link>

            <div className={styles.actions}>
                <nav className={styles.nav} aria-label="Navegação principal">
                    <Link href="/loja">Loja</Link>
                    <Link href="/#cultura">Cultura</Link>
                    <Link href="/#wheels">Wheels</Link>
                </nav>

                <CartDrawer />
            </div>
        </header>
    );
}
