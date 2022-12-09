import './css/styles.css';
import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';
import { fetchCountries } from './JS/fetchCountries';

const DEBOUNCE_DELAY = 300;
const entryCountry = document.querySelector('#search-box');
const countryList = document.querySelector('ul.country-list');
const countryContainer = document.querySelector('div.country-info');

function showCountryFlagName(data) {
  const newListElement = document.createElement('li');
  newListElement.classList.add('country-list__item');

  const countryDescription = document.createElement('span');
  countryDescription.classList.add('country-list__description');
  countryDescription.textContent = data.name.official;

  const countryFlag = document.createElement('img');
  countryFlag.classList.add('country-list__flag');
  countryFlag.setAttribute('src', data.flags.svg);

  countryList.appendChild(newListElement);
  newListElement.append(countryFlag, countryDescription);

  createSvg(newListElement);
}

function showCountryData(obj, targetPlace) {
  //create an array from keys for detailed country data
  const keys = Object.keys(obj).filter(
    key => key === 'capital' || key === 'population' || key === 'languages'
  );

  //create details of country for every key -> obj keys
  for (const key of keys) {
    const insertHeaderData = document.createElement('p');
    insertHeaderData.classList.add('country-info__heading');

    const insertHeaderDetails = document.createElement('span');
    insertHeaderDetails.classList.add('country-info__details');

    targetPlace.appendChild(insertHeaderData);

    insertHeaderData.textContent = `${key}:`;
    insertHeaderData.appendChild(insertHeaderDetails);
    insertHeaderDetails.textContent = Object.values(obj[key]).join(', ');

    if (!isNaN(obj[key])) {
      insertHeaderDetails.textContent = obj[key].toLocaleString();
    }
  }
}

function checkMatches(data) {
  if (data.length > 10) {
    return Notiflix.Notify.info(
      'Too many matches found. Please enter a more specific name.'
    );
  } else if (data.length > 1 && data.length < 11) {
    data.forEach(element => {
      showCountryFlagName(element);
    });
  } else {
    showCountryFlagName(...data);
    showCountryData(...data, countryContainer);
  }
}

function showUnfold(el) {
  //el as HTML created element
  el.classList.add('country-list__description--unfold');
  const detailsElements = Array.from(el.children);

  detailsElements.forEach(e => {
    e.classList.add('country-info__heading--unfold');
  });
}

function createSvg(el) {
  const svgElements = ['up2', 'down3'];
  const xlinks = 'http://www.w3.org/1999/xlink';
  const nameSpace = 'http://www.w3.org/2000/svg';

  svgElements.forEach(e => {
    const newSvg = document.createElementNS(nameSpace, 'svg');
    const use = document.createElementNS(nameSpace, 'use');

    newSvg.classList.add('country-list__svg');

    use.setAttributeNS(xlinks, 'xlink:href', `./img/icons.svg#up2`);
    use.setAttribute('width', '18');
    use.setAttribute('height', '18');

    el.appendChild(newSvg);
    newSvg.appendChild(use);

  });
}

entryCountry.addEventListener(
  'input',
  debounce(() => {
    countryList.replaceChildren();

    if (countryContainer.hasChildNodes()) {
      countryContainer.replaceChildren();
    }

    let countryName = entryCountry.value.trim();

    fetchCountries(countryName)
      .then(data => {
        checkMatches(data);
      })
      .catch(err => {
        Notiflix.Notify.failure('Oops, there is no country with that name');
        // console.log(err);
      });
  }, 300)
);

document.body.addEventListener('click', e => {
  const childrenToRemove = Array.from(e.target.children);

  if (!e.target.classList.contains('country-list__description')) {
    return;
  }

  if (!e.target.classList.contains('country-list__description--unfold')) {
    fetchCountries(e.target.textContent) //getting data from promise
      .then(data => {
        showCountryData(data[0], e.target);
        showUnfold(e.target);
      })
      .catch(err => {
        Notiflix.Notify.failure('Oops, there is no country with that name');
        console.log(err);
      });
  }

  if (e.target.classList.contains('country-list__description--unfold')) {
    e.target.classList.toggle('country-list__description--unfold');
    childrenToRemove.forEach(e => {
      e.remove();
    });
  }
});
