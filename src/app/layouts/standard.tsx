import classNames from "classnames";
import { CiHome } from "react-icons/ci";
import { GiFallingLeaf } from "react-icons/gi";
import { BiFoodMenu } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { FaStoreAlt } from "react-icons/fa";
import { MdFoodBank } from "react-icons/md";
import { PiBooksBold } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";

export default function StandardLayout({ children, currentBasePage }: { children: React.ReactNode, currentBasePage: string | undefined }) {	

    const navItems = {
        'home': { label: "Home", href: "/", icon: CiHome },
        'seasons': { label: "Seasons", href: "/seasons", icon: GiFallingLeaf },
        'recipes': { label: "Recipes", href: "/recipes", icon: BiFoodMenu },
        'users': { label: "Users", href: "/users", icon: FaUsers },
        'grocery-stores': { label: "Grocery Stores", href: "/grocery-stores", icon: FaStoreAlt },
        'pantries': { label: "Pantries", href: "/pantries", icon: MdFoodBank },
        'profile': { label: "Profile", href: "/profile", icon: CgProfile },
        'recipe-boxes': { label: "Recipe Boxes", href: "/recipe-boxes", icon: PiBooksBold },
    }

	return (
		<>
			<header>
				 <nav className="main-nav">
                    {
                        Object.entries( navItems ).map( ( [ key, item ] ) => {
                            const Icon = item.icon;
                            return (
                                <a 
                                    key={key}
                                    className={ classNames( {
                                        'nav-item': true,
                                        'nav-item-active': currentBasePage === key
                                    } ) } 
                                    href={item.href}
                                >
                                    <span className="nav-item-icon"><Icon /></span>
                                    <span className="nav-item-label">{item.label}</span>
                                </a>
                            )
                        } )
                    }
                </nav>
			</header>
			<main>
				{children}
			</main>
		</>
	);
}