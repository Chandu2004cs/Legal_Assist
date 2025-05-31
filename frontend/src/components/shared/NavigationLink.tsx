import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./NavigationLink.module.css";

type Props = {
	to: string;
	text: string;
	onClick?: () => Promise<void>;
};

const NavigationLink = ({ to, text, onClick }: Props) => {
	return (
		<motion.div
			className={styles.linkWrapper}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.97 }}
			onClick={onClick}
		>
			<NavLink
				to={to}
				className={({ isActive }) =>
					isActive ? `${styles.link} ${styles.active}` : `${styles.link}`
				}
			>
				{text}
			</NavLink>
		</motion.div>
	);
};

export default NavigationLink;
