let config = {
    width: 100,
    height: 100,
    url: 'http://localhost:3002/ad/1'
}
const createAd = () => {
    let script = document.currentScript;
    let newDiv = document.createElement('div');
    newDiv.id = 'ad' + config.placement_id;
    newDiv.style.width = config.width + 'px';
    newDiv.style.height = config.height + 'px';
    script.after(newDiv);
    // 创建一个iframe
    let iframe = document.createElement('iframe');
    iframe.src = config.url;
    iframe.width = config.width;
    iframe.height = config.height;
    iframe.scrolling = 'no';
    iframe.frameBorder = 0;
    iframe.marginWidth = 0;
    iframe.marginHeight = 0;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.width = config.width + 'px';
    iframe.style.height = config.height + 'px';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';
    newDiv.appendChild(iframe);
}