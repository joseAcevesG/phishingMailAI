import styles from "./ToggleButtonGroup.module.css";

interface ToggleButtonGroupProps {
	selectedMethod: "magic" | "password";
	setSelectedMethod: React.Dispatch<React.SetStateAction<"magic" | "password">>;
}

/**
 * ToggleButtonGroup is a component that renders two toggle buttons
 * for selecting between "magic" and "password" methods. It visually
 * highlights the currently selected method and triggers a callback
 * to update the selected method when a button is clicked.
 *
 * @param selectedMethod A string indicating the currently selected method ("magic" or "password").
 * @param setSelectedMethod A function to update the selected method.
 */
const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
	selectedMethod,
	setSelectedMethod,
}) => (
	<div className={styles.toggleContainer}>
		{/* This button is responsible for setting the selectedMethod to "magic". */}
		{/* It is highlighted if the selectedMethod is "magic". */}
		<button
			className={`${styles.toggleButton} ${
				selectedMethod === "magic" ? styles.toggleActive : ""
			}`}
			onClick={() => setSelectedMethod("magic")}
			type="button"
		>
			Magic Link
		</button>
		{/* This button is responsible for setting the selectedMethod to "password". */}
		{/* It is highlighted if the selectedMethod is "password". */}
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
