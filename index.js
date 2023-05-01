function handleScroll(event) {
    const rightNavContainer = event.target;
    const leftNavContainer = document.querySelector('.left-nav-container');
  
    const scrollTop = rightNavContainer.scrollTop;
    leftNavContainer.style.top = `${-scrollTop}px`;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const rightNavContainer = document.querySelector('.right-nav-container');
    rightNavContainer.addEventListener('scroll', handleScroll);
  });
  