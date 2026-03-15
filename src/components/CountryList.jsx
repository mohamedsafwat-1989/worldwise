import CityItem from "./CityItem";
import styles from "./CountryList.module.css";
import Spinner from "./Spinner";
import Message from "./Message";
import CountryItem from "./CountryItem";
import { useCities } from "../context/CitiesContext";
function CountryList() {
	const { cities, isLoading } = useCities();
	if (isLoading) return <Spinner />;
	if (!cities.length)
		return (
			<Message message="Add your first city by clicking the city on the map" />
		);
	const countries = cities.reduce((arr, city) => {
		if (!arr.map((el) => el.country).includes(city.country))
			return [...arr, { country: city.country }];
		return arr;
	}, []);
	return (
		<ul className={styles.countryList}>
			{countries.map((country) => (
				<CountryItem country={country} key={country.country} />
			))}
		</ul>
	);
}

export default CountryList;
