import {useRef, useState, useEffect} from 'react';

import Places from './components/Places.jsx';
import {AVAILABLE_PLACES} from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import {sortPlacesByDistance} from "./loc.js";

const PICKED_ITEMS_STORAGE_KEY = 'pickedItems';

function App() {
    const modal = useRef();
    const selectedPlace = useRef();
    const [pickedPlaces, setPickedPlaces] = useState(JSON.parse(localStorage.getItem(PICKED_ITEMS_STORAGE_KEY)) || []);
    const [sortedPlaces, setSortedPlaces] = useState([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const sortedPlaces = sortPlacesByDistance(AVAILABLE_PLACES, position.coords.latitude, position.coords.longitude);
            setSortedPlaces(sortedPlaces);
        })
    }, []);

    const fallbackText = sortedPlaces.length === 0 ?
        'Please, allow location access to see nearest places.'
        :
        'Sorting places according to your location...';


    function handleStartRemovePlace(id) {
        modal.current.open();
        selectedPlace.current = id;
    }

    function handleStopRemovePlace() {
        modal.current.close();
    }

    function handleSelectPlace(id) {
        setPickedPlaces((prevPickedPlaces) => {
            if (prevPickedPlaces.some((place) => place.id === id)) {
                localStorage.setItem(PICKED_ITEMS_STORAGE_KEY, JSON.stringify(prevPickedPlaces));
                return prevPickedPlaces;
            }
            const place = AVAILABLE_PLACES.find((place) => place.id === id);
            const updatedPickedPlaces = [place, ...prevPickedPlaces];
            localStorage.setItem(PICKED_ITEMS_STORAGE_KEY, JSON.stringify(updatedPickedPlaces));
            return updatedPickedPlaces;
        });
    }

    function handleRemovePlace() {
        setPickedPlaces((prevPickedPlaces) =>
            prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
        );
        localStorage.setItem(PICKED_ITEMS_STORAGE_KEY, JSON.stringify(pickedPlaces));
        modal.current.close();
    }

    return (
        <>
            <Modal ref={modal}>
                <DeleteConfirmation
                    onCancel={handleStopRemovePlace}
                    onConfirm={handleRemovePlace}
                />
            </Modal>

            <header>
                <img src={logoImg} alt="Stylized globe"/>
                <h1>PlacePicker</h1>
                <p>
                    Create your personal collection of places you would like to visit or
                    you have visited.
                </p>
            </header>
            <main>
                <Places
                    title="I'd like to visit ..."
                    fallbackText={'Select the places you would like to visit below.'}
                    places={pickedPlaces}
                    onSelectPlace={handleStartRemovePlace}
                />
                <Places
                    title="Available Places"
                    places={sortedPlaces}
                    onSelectPlace={handleSelectPlace}
                    fallbackText={fallbackText}
                />
            </main>
        </>
    );
}

export default App;
