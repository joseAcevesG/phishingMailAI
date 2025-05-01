import styles from "./ToggleButtonGroup.module.css";

interface ToggleButtonGroupProps {
	selectedMethod: "magic" | "password";
	setSelectedMethod: React.Dispatch<React.SetStateAction<"magic" | "password">>;
}

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
	selectedMethod,
	setSelectedMethod,
}) => (
	<div className={styles.toggleContainer}>
		<button
			className={`${styles.toggleButton} ${
				selectedMethod === "magic" ? styles.toggleActive : ""
			}`}
			onClick={() => setSelectedMethod("magic")}
			type="button"
		>
			Magic Link
		</button>
		<button
			className={`${styles.toggleButton} ${
				selectedMethod === "password" ? styles.toggleActive : ""
			}`}
			onClick={() => setSelectedMethod("password")}
			type="button"
		>
			Password
		</button>
	</div>
);

export default ToggleButtonGroup;
