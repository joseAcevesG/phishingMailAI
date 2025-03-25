import { useEffect, useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "../assets/react.svg";

interface ApiData {
	name: string;
	// Add more fields as needed based on your API response
}

export default function Home() {
	const [count, setCount] = useState(0);
	const [data, setData] = useState<ApiData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const response = await fetch("/api");
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const jsonData = await response.json();
			setData(jsonData);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<>
			<div>
				<a href="https://vite.dev" rel="noreferrer" target="_blank">
					<img alt="Vite logo" className="logo" src={viteLogo} />
				</a>
				<a href="https://react.dev" rel="noreferrer" target="_blank">
					<img alt="React logo" className="logo react" src={reactLogo} />
				</a>
			</div>
			<h1>{data?.name}</h1>

			<div className="card">
				<button onClick={() => setCount((count) => count + 1)} type="button">
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
}
