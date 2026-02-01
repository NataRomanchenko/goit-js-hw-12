import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

let query = '';
let page = 1;
let totalPages = 0;

const PER_PAGE = 15;

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();

  query = e.target.elements['search-text'].value.trim();
  page = 1;
  totalPages = 0;

  clearGallery();
  hideLoadMoreButton();

  if (!query) return;

  await fetchImages();
}

async function onLoadMore() {
  page += 1;
  await fetchImages();
}

async function fetchImages() {
  try {
    showLoader();

    const data = await getImagesByQuery(query, page);

    
    if (data.hits.length === 0 && page === 1) {
      hideLoadMoreButton();
      iziToast.error({
        message: 'Sorry, there are no images matching your search query.',
        position: 'topRight',
      });
      return;
    }

    
    if (page === 1) {
      totalPages = Math.ceil(data.totalHits / PER_PAGE);
    }

    createGallery(data.hits);

    
    if (page >= totalPages) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }

    if (page > 1) {
      smoothScroll();
    }
  } catch (error) {
    hideLoadMoreButton();
    iziToast.error({
      message: 'Something went wrong. Please try again.',
      position: 'topRight',
    });
    console.error(error);
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const firstCard = gallery.firstElementChild;
  if (!firstCard) return;

  const { height } = firstCard.getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
