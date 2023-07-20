var myProjectName = "cet";
var spinnerLoaderForMenu = document.getElementById("theSpinnerLoaderForMenu");
var spinnerLoader = document.getElementById("theSpinnerLoader");
let bookListHtmlItem = document.getElementById("book-list");
let videoPlayerBoyHtml = document.getElementById("video_player_box");
var myVideoHtml = document.getElementById("my-video");
var isCurrentBookFree = true;
var src = "";
var started = new Date();

var mCurrentBookId = null;

var currentBooksNumOfPages = 0;

var currentVideoSeekerPosition = 0;

function myStartHandler(e) {
    console.log("play event was called");
    started = new Date();
}

function myEndHandler(e) {
    var ended = new Date();
    var distance = (ended.getTime() - started.getTime()) / 1000;
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
	
	let allPagesVisited = [...Array(currentBooksNumOfPages).keys()];
	let lastPageIndex = currentBooksNumOfPages - 1;
	
    var result = {
        bookId: params.book || mCurrentBookId,
        startedAt: started,
        duration: distance,
        pagesVisited: allPagesVisited,
        lastPageVisited: lastPageIndex,
    };
    var resultJson = JSON.stringify(result)
    console.log(resultJson)
    window.top.postMessage(resultJson, '*');
}

function myPauseHandler(e) {
	var ended = new Date();
    var distance = (ended.getTime() - started.getTime()) / 1000;
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
	
	let allPagesVisited = [...Array(currentBooksNumOfPages).keys()];
	let lastPageIndex = currentBooksNumOfPages - 1;
	
	let currPagesVisited = currentVideoSeekerPosition > 80 ? allPagesVisited : [0];
	
    var result = {
        bookId: params.book || mCurrentBookId,
        startedAt: started,
        duration: distance,
        pagesVisited: currPagesVisited,
        lastPageVisited: lastPageIndex,
    };
    var resultJson = JSON.stringify(result)
    console.log(resultJson)
    window.top.postMessage(resultJson, '*');
}

function pauseBook() {
	if (isVideoPlayerNeeded()) {
		myVideoHtml.pause();
	} else {
		window.unityInstance.SendMessage('JavaScriptHook', 'PauseBook');
	}
}

function startBook() {
	if (isVideoPlayerNeeded()) {
		myVideoHtml.play();
	} else {
		window.unityInstance.SendMessage('JavaScriptHook', 'StartBook');
	}
}

function toggleStartPause() {
	if (isVideoPlayerNeeded()) {
		if (myVideoHtml.paused == true) {
			myVideoHtml.play();
		} else {
			myVideoHtml.pause();
		}
	} else {
		window.unityInstance.SendMessage('JavaScriptHook', 'TogglePauseBook');
	}
}

window.addEventListener('message', event => {
    if (event.data === "toggleStartPause")
        toggleStartPause();
    else if (event.data === "startBook")
        startBook();
    else if (event.data === "pauseBook")
        pauseBook();
});

function myMoreThanEigthyPercentReachedHandler(seekerPercent) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
	
	let allPagesVisited = [...Array(currentBooksNumOfPages).keys()];
	let lastPageIndex = currentBooksNumOfPages - 1;
	
    var result = {
        bookId: params.book || mCurrentBookId,
        startedAt: started,
        duration: seekerPercent,
        pagesVisited: allPagesVisited,
        lastPageVisited: lastPageIndex,
    };
    var resultJson = JSON.stringify(result)
    console.log(resultJson)
    window.top.postMessage(resultJson, '*');
}

function LoadingMenu(isLoading)
{
    spinnerLoaderForMenu.style.display = isLoading ?  "block" : "none";
    return 
}

function Loading(isLoading)
{
    spinnerLoader.style.display = isLoading ?  "block" : "none";
    return 
}

function BookDataRecived(jsonData, isAllowedToSeePaidBooks)
{
	console.log("isAllowedToSeePaidBooks : " + isAllowedToSeePaidBooks);	
    isCurrentBookFree = true;
    console.log("books data arrived");
    LoadingMenu(false);
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    var bookId = params.book;
    if (!bookId)
        bookId = params.bookId;

    // var posterImg = "https://api.v2.bookrclass.com/api/media/Ym9vay1jb3Zlci93LzMvdzNsa3p5ZzFZYW1pQjlxVXJMYU1vSFZseDU1UXJUeGhVT1VvbkVQWUs0LmpwZw==/original_4k.jpg";
    var posterImg = "https://video-base-cet.bookrclass.com/book41.jpg"; /// TODO: poster image path for CET needed

    var availableBooks = [];
    var myVideoBaseUrl = "";
    var bookListingAvailable = false;

    for (var index in jsonData.projects) {
        var projectData = jsonData.projects[index];

        if (projectData.projectName == myProjectName) {
            availableBooks = projectData.booksList;
            myVideoBaseUrl = projectData.videoBase;
            bookListingAvailable = projectData.bookListingAvailable;
        }
    }

    for (var index in availableBooks) {
        var book = availableBooks[index];
		
		currentBooksNumOfPages = book.numberOfPages;

        const li = document.createElement('li');
        li.innerHTML = `<h3><a href="?book=`+book.id+ `">`+book.title+`</a></h3>`;
        if (bookListHtmlItem !== undefined && bookListHtmlItem !== null) {
            bookListHtmlItem.appendChild(li);
        }
    }
    
    if (bookId !== undefined && bookId !== null && bookId !== "") {
        firstAvailableBookIdForProject = bookId;
        videoPlayerBoyHtml.hidden = false;
		videoPlayerBoyHtml.style.display = "block";
        bookListHtmlItem.remove();

        // load poster image
        posterImg = myVideoBaseUrl + "book" + bookId + ".jpg";

        // load video mp4
        src = myVideoBaseUrl + "book" + bookId + ".mp4";

    } else if (bookListingAvailable == false) {
        // Pick first available bookId (as default) if ther book listing is not available for this project
        var firstAvailableBookIdForProject = availableBooks[0].id;
        mCurrentBookId = firstAvailableBookIdForProject;

        videoPlayerBoyHtml.hidden = false;
		videoPlayerBoyHtml.style.display = "block";
        bookListHtmlItem.remove();

        // load poster image
        posterImg = myVideoBaseUrl + "book" + firstAvailableBookIdForProject + ".jpg";

        // load video mp4
        src = myVideoBaseUrl + "book" + firstAvailableBookIdForProject + ".mp4";
    } else {
        // Book listing, if no specific book selected with url param, and if this project has book listing enabled on config
        bookListHtmlItem.hidden = false;
        videoPlayerBoyHtml.remove();
    }

    var myVideoSrc = document.getElementById("videosrc");
    if (myVideoSrc) myVideoSrc.src = src;
    if (myVideoHtml) {
        console.log("myVideoHtml is loading");
        myVideoHtml.addEventListener('ended',myEndHandler);
        myVideoHtml.addEventListener('pause',myPauseHandler);
        myVideoHtml.addEventListener('play',myStartHandler);
		myVideoHtml.addEventListener('timeupdate', () => {
		  let seekerPercent = myVideoHtml.currentTime / myVideoHtml.duration * 100;
		  currentVideoSeekerPosition = seekerPercent;
		});
        myVideoHtml.setAttribute("poster",posterImg);
        myVideoHtml.load();
        console.log("myVideoHtml is loaded");
    }
}

function LoadMobile()
{
	bookListHtmlItem.hidden = true;
    videoPlayerBoyHtml.hidden = true;
    myVideoHtml.pause();
	
	const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

	var bookId = params.book;
    if (!bookId)
        bookId = params.bookId;

    let bookDataUrl = "https://bookrlab.com/ClassWebGLInfoProvider/"; // BookData URL for CET
	
    LoadingMenu(true);
    console.log("started loading mobile");
    fetch(bookDataUrl)
        .then(response => {
            console.log("Books recived");
            return response.json();
        })
        .then(jsonData =>  {		  
            BookDataRecived(jsonData, true);
        }).catch((error) => {
            console.error('Error:', error);
            // BookDataRecived(jsonData, false);
        });
}

window.onblur = (event) => { pauseBook(); };
