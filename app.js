// Custom Http Module
function customHttp() {
return {
	get(url, cb) {
	try {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.addEventListener('load', () => {
		if (Math.floor(xhr.status / 100) !== 2) {
			cb(`Error. Status code: ${xhr.status}`, xhr);
			return;
		}
		const response = JSON.parse(xhr.responseText);
		cb(null, response);
		});

		xhr.addEventListener('error', () => {
		cb(`Error. Status code: ${xhr.status}`, xhr);
		});

		xhr.send();
	} catch (error) {
		cb(error);
	}
	},
	post(url, body, headers, cb) {
	try {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.addEventListener('load', () => {
		if (Math.floor(xhr.status / 100) !== 2) {
			cb(`Error. Status code: ${xhr.status}`, xhr);
			return;
		}
		const response = JSON.parse(xhr.responseText);
		cb(null, response);
		});

		xhr.addEventListener('error', () => {
		cb(`Error. Status code: ${xhr.status}`, xhr);
		});

		if (headers) {
		Object.entries(headers).forEach(([key, value]) => {
			xhr.setRequestHeader(key, value);
		});
		}

		xhr.send(JSON.stringify(body));
	} catch (error) {
		cb(error);
	}
	},
};
}
// Init http module
const http = customHttp();

const newsService = (function () {
	const apiKey = '9b9c0b66703746e2b10a96aee825c85e';
	const apiUrl = 'https://newsapi.org/v2';

	return {
		topHeadlines(country = 'ru', category = 'general', cb) {
			http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,cb)
		},
		everything(query, cb) {
			http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`,cb)
		},
	}
})();

//elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categorySelect = form.elements['category'];

form.addEventListener('submit', (e) => {
	e.preventDefault();
	loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function()
{
	M.AutoInit();
	loadNews();
});

//load news
function loadNews()
{
	showPreloader();

	const country = countrySelect.value;
	const searchText = searchInput.value;
	const category = categorySelect.value;

	if(!searchText){
		newsService.topHeadlines(country, category, onGetResponse);
	}else
	{
		newsService.everything(searchText, onGetResponse);
	}
}
//func on get response on server
function onGetResponse(error, response)
{
	removePreloader();

	if(error)
	{
		showMessage(error, 'error-msg');
		return;
	}
	if (!response.articles.length)
	{
		showMessage("Новости не найдены", 'error-msg')
		return;
	}
	renderNews(response.articles);

}
// func render news
function renderNews(news)
{
	const newsContainer = document.querySelector('.news-container .row');
	if (newsContainer.children.length)
	{
		clearContainer(newsContainer);
	}
	let fragment = '';
	news.forEach((newsItem) =>
	{
		const el = newsTemplate(newsItem);
		fragment += el
	})

	newsContainer.insertAdjacentHTML('afterbegin', fragment)
}
//func clear newsContainer
function clearContainer(container)
{
	//container.innerHTML = '';
	let child = container.lastElementChild;
	while(child) {
		container.removeChild(child);
		child = container.lastElementChild;
	}
}


//func template news
function newsTemplate({urlToImage, title, description, url})
{
	return `
		<div class="col s12">
			<div class="card">
				<div class="card-image">
					<img src="${urlToImage}"/>
					<span class="card-title">${title || ''}</span>
				</div>
				<div class="card-content">
					<p>${description || ''}</p>
				</div>
				<div class="card-action">
					<a href="${url}">Read more</a>
				</div>
			</div>
		</div>
	`;
}


function showMessage(msg, type = 'success')
{
	M.toast({html: msg, classes: type})
}

//show preloader
function showPreloader()
{
	document.body.insertAdjacentHTML('afterbegin',`
		<div class="progress">
			<div class="indeterminate"></div>
		</div>
	`)
}

//remove preloader function
function removePreloader()
{
	const loader = document.querySelector('.progress')
	if(loader)
	{
		loader.remove();
	}
}