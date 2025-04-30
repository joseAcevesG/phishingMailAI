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
			type="button"
			onClick={() => setSelectedMethod("magic")}
		>
			Magic Link
		</button>
		<button
			className={`${styles.toggleButton} ${
				selectedMethod === "password" ? styles.toggleActive : ""
			}`}
			type="button"
			onClick={() => setSelectedMethod("password")}
		>
			Password
		</button>
	</div>
);

export default ToggleButtonGroup;
