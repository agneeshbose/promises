const getPlanets = async () => {
    // Get all the planets
    const planetsList = await axios
        .get('https://swapi.dev/api/planets/')
        .then(({ data }) => {
            let list = [...data.results];
            let next = data.next;

            return (async () => {
                while (next) {
                    const res = await axios.get(next);
                    list.push(...res.data.results);
                    next = res.data.next;
                }
                return list;
            })();
        });

    // Filter out planets who have appeared in at least 2 movies
    const filteredPlanetsList = planetsList.filter(
        (planet) => planet.films.length >= 2
    );

    // Get residents of all the planets in filtered list
    const residents = await Promise.all(
        filteredPlanetsList.map((planet) => {
            return Promise.all(
                planet.residents.map((resident) => {
                    return axios.get(resident).then((res) => res.data);
                })
            );
        })
    );

    // Get species info for all the residets in each planets in filtered list
    const species = await Promise.all(
        residents.map((resident) => {
            return Promise.all(
                resident.map((resid) => {
                    return Promise.all(
                        resid.species.map((i) =>
                            axios.get(i).then((res) => res.data)
                        )
                    );
                })
            );
        })
    );

    const planets = [];

    // Filter out planets with residents having reptiles
    species.forEach((planet, planetIndex) => {
        planet.forEach((resident) =>
            resident.forEach((item) => {
                if (item.classification === 'reptile') {
                    planets.push(filteredPlanetsList[planetIndex]);
                }
            })
        );
    });

    return planets;
};

getPlanets().then((data) => {
    document.getElementById('root').innerHTML = JSON.stringify(data, null, 2);
});

// Note: There are no planets available who have appeared in at lease 2 films
// with residents having reptiles at swapi.dev.
