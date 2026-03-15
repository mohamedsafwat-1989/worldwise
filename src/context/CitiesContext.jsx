import { createContext, useContext, useEffect, useReducer } from "react";
const API_URL = "https://69b6fb5bffbcd0286094521e.mockapi.io/api/v1";
const CitiesContext = createContext();

const initialState = {
	cities: [],
	isLoading: false,
	currentCity: {},
	error: "",
};

function reducer(state, action) {
	switch (action.type) {
		case "loading":
			return { ...state, isLoading: true };
		case "cities/loaded":
			return { ...state, isLoading: false, cities: action.payload };
		case "city/loaded":
			return { ...state, isLoading: false, currentCity: action.payload };
		case "city/created":
			return {
				...state,
				isLoading: false,
				cities: [...state.cities, action.payload],
				currentCity: action.payload,
			};
		case "city/deleted":
			return {
				...state,
				isLoading: false,
				cities: state.cities.filter((city) => city.id !== action.payload),
				currentCity: {},
			};
		case "rejected":
			return { ...state, isLoading: false, error: action.payload };

		default:
			return Error("Unknown action type");
	}
}

function CitiesProvider({ children }) {
	const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
		reducer,
		initialState,
	);

	useEffect(function () {
		async function fetchCities() {
			dispatch({ type: "loading" });
			try {
				const res = await fetch(`${API_URL}/cities`);
				const data = await res.json();
				dispatch({ type: "cities/loaded", payload: data });
			} catch {
				dispatch({ type: "rejected", payload: "Error fetching cities data" });
			}
		}
		fetchCities();
	}, []);

	async function getCity(id) {
		if (currentCity.id === Number(id)) return;
		dispatch({ type: "loading" });
		try {
			const res = await fetch(`${API_URL}/cities/${id}`);
			const data = await res.json();
			dispatch({ type: "city/loaded", payload: data });
		} catch {
			dispatch({ type: "rejected", payload: "Error fetching the city data" });
		}
	}

	async function createCity(newCity) {
		dispatch({ type: "loading" });
		try {
			const res = await fetch(`${API_URL}/cities`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newCity),
			});
			const data = await res.json();
			// to update the cities state with the new city, we can either fetch all cities again or just add the new city to the existing state. Here we choose to add the new city to the existing state for better performance.
			dispatch({ type: "city/created", payload: data });
		} catch {
			dispatch({ type: "rejected", payload: "Error creating the city" });
		}
	}

	async function deleteCity(id) {
		dispatch({ type: "loading" });
		try {
			await fetch(`${API_URL}/cities/${id}`, {
				method: "DELETE",
			});

			// to update the cities state with the new city, we can either fetch all cities again or just add the new city to the existing state. Here we choose to add the new city to the existing state for better performance.
			dispatch({ type: "city/deleted", payload: id });
		} catch {
			dispatch({ type: "rejected", payload: "Error deleting the city " });
		}
	}
	return (
		<CitiesContext.Provider
			value={{
				cities,
				isLoading,
				currentCity,
				error,
				getCity,
				createCity,
				deleteCity,
			}}
		>
			{children}
		</CitiesContext.Provider>
	);
}

function useCities() {
	const context = useContext(CitiesContext);
	if (context === undefined)
		throw new Error("useCities must be used within CitiesProvider");
	return context;
}
export { CitiesProvider, useCities };
