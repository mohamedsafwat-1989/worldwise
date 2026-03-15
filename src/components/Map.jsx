import { useNavigate } from "react-router-dom";

import styles from "./Map.module.css";
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import { useState, useEffect } from "react";
import { useCities } from "../context/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import Button from "./Button";
import { useUrlPosition } from "../hooks/useUrlPosition";
function Map() {
	const [mapPosition, setMapPosition] = useState([51.505, -0.09]);
	const { cities } = useCities();
	const {
		isLoading: isLoadingPosition,
		position: geolocationPosition,
		getPosition,
	} = useGeolocation(mapPosition);

	const [lat, lng] = useUrlPosition();

	useEffect(
		function () {
			if (lat && lng) setMapPosition([Number(lat), Number(lng)]);
		},
		[lat, lng],
	);
	useEffect(
		function () {
			if (geolocationPosition?.lat && geolocationPosition?.lng)
				setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
		},
		[geolocationPosition],
	);
	return (
		<div className={styles.mapContainer}>
			<Button type="position" onClick={getPosition}>
				{isLoadingPosition ? "Loading..." : "Use my location"}
			</Button>

			<MapContainer
				className={styles.map}
				center={mapPosition}
				zoom={6}
				scrollWheelZoom={true}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{cities.map((city) => (
					<Marker
						position={[city.position.lat, city.position.lng]}
						key={city.id}
					>
						<Popup>
							{city.cityName}
							<br />
							{city.notes}
						</Popup>
					</Marker>
				))}
				<ChangeCenter position={mapPosition} />
				<DetectClick />
			</MapContainer>
		</div>
	);
}

function ChangeCenter({ position }) {
	const map = useMap();
	useEffect(
		function () {
			if (position[0] && position[1]) map.setView(position);
		},
		[map, position],
	);
	return null;
}

function DetectClick() {
	const navigate = useNavigate();
	useMapEvents({
		click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
	});
	return null;
}
export default Map;
