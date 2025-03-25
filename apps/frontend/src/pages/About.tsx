export default function About() {
	return (
		<div className="about-container">
			<h1>About Us</h1>
			<p>
				Welcome to our SPA application! This is a simple demo showing React
				Router functionality.
			</p>
			<p>We have implemented various routes including:</p>
			<ul>
				<li>Home page (/)</li>
				<li>About page (/about)</li>
				<li>Dynamic ID page (/[id])</li>
			</ul>
		</div>
	);
}
