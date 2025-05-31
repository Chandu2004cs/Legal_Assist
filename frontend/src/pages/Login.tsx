import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import bot2 from "/page-photos/robot-2.png";

import PageImage from "../components/auth/PageImage";
import FormLabel from "../components/auth/FormLabel";
import Button from "../components/shared/Button";

import styles from "./AuthForm.module.css";
import { useAuth } from "../context/context";

const Login = () => {
	const [buttonName, setButtonName] = useState("Login");
	const navigate = useNavigate();
	const auth = useAuth();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			setButtonName("Loading...");
			toast.loading("Signing in...", { id: "login" });
			await auth?.login(email, password);
			toast.success("Signed in successfully", { id: "login" });
			navigate("/chat");
		} catch (error: any) {
			toast.error(error.message || "Login failed", { id: "login" });
		} finally {
			setButtonName("Login");
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.imageWrapper}>
				<PageImage src={bot2} alt="Login bot" className={styles.image} />
			</div>
			<div className={styles.formWrapper}>
				<h2 className={styles.title}>Log Into Your Account</h2>
				<form className={styles.form} onSubmit={handleSubmit}>
					<FormLabel
						className={styles.input}
						htmlFor="email"
						id="email"
						name="email"
						type="text"
						required
						maxLength={40}
						minLength={5}
						label="E-Mail"
						onChange={() => {}}
						inputPH="name@example.com"
					/>
					<FormLabel
						className={styles.input}
						htmlFor="password"
						id="password"
						name="password"
						type="password"
						required
						maxLength={20}
						minLength={8}
						label="Password"
						onChange={() => {}}
						inputPH="••••••••"
					/>
					<Button
						buttonLabel={buttonName}
						type="submit"
						className={styles.button}
					/>
				</form>
				<p className={styles.redirect}>
					Don’t have an account? <Link to="/signup">Create one</Link>
				</p>
			</div>
		</div>
	);
};

export default Login;
