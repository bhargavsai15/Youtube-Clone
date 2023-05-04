const API_KEY = "AIzaSyBAcguAnUr3msjTr6No7lYkf3Z_YOnTKKs";
const expandBtn = document.querySelector('.expand-btn');
const userIconButton = document.querySelector('.user-settings').children[0];
const zonarCard = document.querySelectorAll('.top-scroll-container')
const searchBtn = document.getElementById('search');
const videoGridContainer = document.querySelector('.video-grid-container');
let expandFlag = true;
let toggle = true;


//Functionality for expand settings container when user click on userIcon on right side
//toggle funciton
userIconButton.addEventListener('click', () => {
  const expand = document.querySelector('.settings-section');
  if (expandFlag) { //if display is none set it to visible
    expand.style.display = 'block';
    expandFlag = false;
  } else {  //if display is already visible display to none
    expand.style.display = 'none';
    expandFlag = true;
  }
})

//API call to load All video categories
async function loadVideoCategories() {
  const URL=`https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=IN&key=${API_KEY}`
  const response = await fetch(URL);
  const videosList = await response.json();
  getVideoCategories(videosList.items);
}

//fetch the all categories
function getVideoCategories(videosList) {
  const topScrollContainer = document.querySelector('.top-scroll-container');
  topScrollContainer.innerHTML = '';
  let innerHtmlString = `<div class="zonar-card active" onclick=toggleCard(this)>
                            <span>All</span>
                         </div>`;
  videosList.forEach(item => {
    innerHtmlString+=` <div class="zonar-card" onclick=toggleCard(this)>
    <span id="${item.id}">${item.snippet.title}</span>
  </div>`
  })
  topScrollContainer.innerHTML = innerHtmlString;
}




// format views functionality
function formatViewsCount(views) {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(0) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(0) + 'K';
  } else {
    return views.toString().toFixed(0);
  }
}

//format timestamp to current time stamp
function convertTimestampToCurrentTime(timestamp) {
  const givenTime = new Date(timestamp);
  const currentTime = new Date();
  const timeDiff = currentTime.getTime() - givenTime.getTime();
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year ago`;
  } else if (months > 0) {
    return `${months} month ago`;
  } else if (weeks > 0) {
    return `${weeks} week ago`;
  } else if (days > 0) {
    return `${days} day ago`;
  } else if (hours > 0) {
    return `${hours} hour ago`;
  } else if (minutes > 0) {
    return `${minutes} minute ago`;
  } else {
    return `${seconds} second ago`;
  }
}



async function fetchCategoryVideosById(categoryId) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&type=video&videoCategoryId=${categoryId}&key=${API_KEY}`;

  const response = await fetch(apiUrl);
  const categoryVideoList = await response.json();
  categoryVideoList.items .forEach(async (item) => {
    const { publishedAt, channelId, title, channelTitle, publishTime } = item.snippet;
    const channelLogo = await getChannelLogo(channelId);
    const thumbnail = item.snippet.thumbnails.medium.url;
    const videoStats = await getVideoByChannelId(channelId);
    console.log(videoStats.viewCount);
    await loadVideoItem(channelLogo,thumbnail,item.snippet,videoStats.viewCount);
  })
}

/* when the page loads for cards will be loaded automatically */
document.addEventListener('DOMContentLoaded', async ()=> {
  await loadVideoCategories();
});

//Load the videos based of category
async function loadVideoItem(channelLogo,thumbnail, { publishedAt, title, channelTitle }, viewCount) {
  const videoCard = document.createElement('div');
  videoCard.className = 'video-card';
  
  const videoThumbnail = document.createElement('img');
  videoThumbnail.src = thumbnail;
  videoCard.append(videoThumbnail);

  const videoTitleCard = document.createElement('div');
  videoTitleCard.className = 'video-title';

  const channelIcon = document.createElement('img');
  channelIcon.src = channelLogo;
  channelIcon.className = 'channel-icon';
  videoTitleCard.append(channelIcon);

  const videoInfo = document.createElement('div');
  videoInfo.className = 'video-info';

  const videoTitle = document.createElement('p');
  videoTitle.className = 'title-name';
  videoTitle.innerText = title;
  const channelName = document.createElement('p');
  channelName.className = 'channel-name light-color';
  channelName.innerText = channelTitle;
  videoInfo.append(videoTitle);
  videoInfo.append(channelName);

  const videoStats = document.createElement('div');
  videoStats.className = 'video-stats light-color';

  const videoViews = document.createElement('span');
  videoViews.className = 'views';
  console.log(viewCount);
  console.log(formatViewsCount(viewCount));
  videoViews.innerText = `${formatViewsCount(parseInt(viewCount))} Views`;
  const uploadedDate = document.createElement('span');
  uploadedDate.className = 'uploaded-time';
  uploadedDate.innerText = `${convertTimestampToCurrentTime(publishedAt)}`;
  videoStats.append(videoViews);
  videoStats.append(uploadedDate);
  videoInfo.append(videoStats);

  videoTitleCard.append(videoInfo);

  videoCard.append(videoTitleCard);

  videoGridContainer.append(videoCard);

}


//Get channel Logo using channel Id
async function getChannelLogo(channelId) {
  const URL = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`;
  const response = await fetch(URL);
  const data = await response.json();
  // console.log(data);
  return await data.items[0].snippet.thumbnails.medium.url;
}

//get video statistics using channelId
async function getVideoByChannelId(channelId) {
  const URL = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${API_KEY}`;
  const response = await fetch(URL);
  const data = await response.json();
  return data.items[0].statistics;
}


async function loadCategoryVideos(event) {
  videoGridContainer.innerHTML = '';
  const categoryId = event.srcElement.id;
  const videoList = await fetchCategoryVideosById(categoryId);

}




zonarCard.forEach(card => {
  card.addEventListener('click', loadCategoryVideos);
})


/* Toggle Card State */
function toggleCard(card) {
  const cardItems = document.getElementsByClassName('zonar-card');
  
  for (let i = 0; i < cardItems.length; i++){
    cardItems[i].classList.remove('active');
  }
  card.classList.add('active');
}


/* Expand button functionality */
function expandMore(event) {
  const collapseContainer = document.querySelector('.collapse-container');
  if (toggle) {
    collapseContainer.style.display = "flex";
    collapseContainer.style.flexFlow = "column";
    expandBtn.children[0].src = "./assets/asset 78.svg";
    expandBtn.children[1].textContent = "Show less";
    toggle = false;
  } else {
    collapseContainer.style.display = "none";
    expandBtn.children[0].src = "./assets/asset 77.svg"
    expandBtn.children[1].textContent = "Show more";
    toggle = true;
  }
  
}

expandBtn.addEventListener('click', expandMore);






//Shrink left side menu
let sidebarFlag = true;
const hamburgerIcon = document.querySelector('.hamburger-icon');
hamburgerIcon.addEventListener('click', () => {
  const largeSidebar = document.querySelector('.left-nav-container');
  const smallSidebar = document.querySelector('.smallest-sidebar');
  console.log(largeSidebar);
  console.log(smallSidebar);
  if (sidebarFlag) {
    largeSidebar.style.display = 'none';
    smallSidebar.style.display = 'block';
    sidebarFlag = false;
  } else {
    smallSidebar.style.display = 'none';
    largeSidebar.style.display = 'flex';
    sidebarFlag = true;
  }
})