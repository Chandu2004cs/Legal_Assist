import mainBot from "/page-photos/homepage-bot.png";
import { NavLink } from "react-router-dom";
import Section from "../components/home/Sections";

import styles from "./Home.module.css";

const Home = () => {
	return (
		<div className={styles.parent}>
			<Section
				src={mainBot}
				alt='Legal Assistant Bot'
				animateImg={true}
				imgStyle={styles.image}
				reverse={false}>
				<h2 className={styles.tagline}>| LEGAL AI ASSISTANT</h2>
				<h1 className={styles.title}>
					Your Trusted <span className={styles.highlight}>Legal Companion</span>
				</h1>
				<p className={styles.description}>
					Meet your 24/7 AI-powered legal assistant. Whether you’re drafting contracts,
					reviewing legal documents, or seeking guidance on your rights — our smart bot is
					here to simplify the law for you.
				</p>
				<NavLink to='/login' className={styles.btn}>
					Start Your Legal Journey
				</NavLink>
			</Section>
		</div>
	);
};

export default Home;
