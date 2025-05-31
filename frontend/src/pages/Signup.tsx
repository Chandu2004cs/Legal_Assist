import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import bot2 from "/page-photos/robot-2.png";

import PageImage from "../components/auth/PageImage";
import FormLabel from "../components/auth/FormLabel";
import Button from "../components/shared/Button";

import styles from "./AuthForm.module.css";
import { useAuth } from "../context/context";


const Signup = () => {
	const [buttonName, setButtonName] = useState("SignUp");
	const navigate = useNavigate();
	const auth = useAuth();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const username = formData.get("username") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirm-password") as string;

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			setButtonName("Loading...");
			toast.loading("Signing up...", { id: "signup" });
			await auth?.signup(username, email, password);
			toast.success("Account created and logged in", { id: "signup" });
			navigate("/login");
		} catch (error: any) {
			toast.error(error.message || "Signup failed", { id: "signup" });
		} finally {
			setButtonName("SignUp");
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.imageWrapper}>
				<PageImage src={bot2} alt="Signup bot image" className={styles.image} />
			</div>
			<div className={styles.formWrapper}>
				<h2 className={styles.title}>Create New Account</h2>
				<form className={styles.form} onSubmit={handleSubmit}>
					<FormLabel
						className={styles.input}
						htmlFor="username"
						id="username"
						name="username"
						type="text"
						required
						maxLength={25}
						minLength={2}
						label="Your Name"
						onChange={() => {}}
						inputPH="John Doe"
					/>
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
						name="password"
						id="password"
						type="password"
						required
						maxLength={20}
						minLength={8}
						label="Password"
						onChange={() => {}}
						inputPH="••••••••"
					/>
					<FormLabel
						className={styles.input}
						htmlFor="confirm-password"
						id="confirm-password"
						name="confirm-password"
						type="password"
						required
						maxLength={20}
						minLength={8}
						label="Confirm Password"
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
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</div>
		</div>
	);
};

export default Signup;