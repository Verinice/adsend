/**
 * AdSend
 * Author: Difatha
 * Description: Seamlessly sends and rotates ads into page containers, matching sibling styles and ensuring fair, animated, and visually integrated ad display.
 *
 * - Replicates computed styles, classes, and IDs from siblings for seamless appearance
 * - Animates ad entry with multiple effects
 * - Ensures fair, round-robin ad rotation
 * - Dynamically detects API base URL
 * - Robust error handling and modular structure
 */
(function () {
  // --- Utility Functions ---

  /**
   * Shuffle an array in place (Fisher-Yates)
   * @param {Array} array
   * @returns {Array}
   */
  function shuffle(array) {
    let m = array.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  /**
   * Get the current page's full URL
   * @returns {string}
   */
  function getCurrentPageUrl() {
    return window.location.href;
  }

  /**
   * Dynamically detect the API base URL
   * @returns {string}
   */
  function getApiBase() {
    try {
      const scriptSrc = document.currentScript && document.currentScript.src;
      if (scriptSrc) {
        const url = new URL(scriptSrc, window.location.origin);
        return url.origin;
      }
    } catch {}
    return window.location.origin;
  }

  // --- Style Replication & Animation ---

  /**
   * Replicate computed styles, classes, and ID from a reference sibling
   * @param {HTMLElement} target
   * @param {HTMLElement[]} siblings
   */
  function replicateSiblingStyles(target, siblings) {
    if (!siblings.length) return;
    const ref = Array.from(siblings).find(
      el => el !== target && window.getComputedStyle(el).display !== "none"
    );
    if (!ref) return;
    const refStyle = window.getComputedStyle(ref);
    for (let i = 0; i < refStyle.length; i++) {
      const prop = refStyle[i];
      target.style.setProperty(prop, refStyle.getPropertyValue(prop), refStyle.getPropertyPriority(prop));
    }
    target.className = ref.className
      .split(' ')
      .filter(c => c && c !== 'ad-send-banner')
      .concat(['ad-send-banner'])
      .join(' ');
    if (ref.id && ref.id !== target.id) {
      target.id = ref.id + '-ad';
    }
  }

  /**
   * Animate ad entry and ensure image fit
   * @param {HTMLElement} adWrapper
   * @param {HTMLElement} refNode
   */
  function animateAdEntry(adWrapper, refNode) {
    adWrapper.classList.remove('ad-flip-in', 'ad-bounce-in', 'ad-fade-in', 'ad-slide-in');
    const animations = ['ad-flip-in', 'ad-bounce-in', 'ad-fade-in', 'ad-slide-in'];
    const anim = animations[Math.floor(Math.random() * animations.length)];
    void adWrapper.offsetWidth;
    adWrapper.classList.add(anim);
    adWrapper.addEventListener('animationend', function handler() {
      adWrapper.classList.remove(anim);
      adWrapper.removeEventListener('animationend', handler);
    });
    const imgs = adWrapper.querySelectorAll('img');
    imgs.forEach(img => {
      img.classList.remove('ad-img-anim');
      void img.offsetWidth;
      img.classList.add('ad-img-anim');
    });
    // Set wrapper and image height to 100% and match sibling height
    if (refNode) {
      const refRect = refNode.getBoundingClientRect();
      adWrapper.style.height = refRect.height + 'px';
      adWrapper.style.maxHeight = refRect.height + 'px';
      adWrapper.style.minHeight = refRect.height + 'px';
      adWrapper.style.width = '100%';
      imgs.forEach(img => {
        img.style.height = '100%';
        img.style.maxHeight = '100%';
        img.style.minHeight = '100%';
      });
    } else {
      adWrapper.style.height = '100%';
      adWrapper.style.maxHeight = '100%';
      adWrapper.style.minHeight = '100%';
      adWrapper.style.width = '100%';
      imgs.forEach(img => {
        img.style.height = '100%';
        img.style.maxHeight = '100%';
        img.style.minHeight = '100%';
      });
    }
  }

  // --- Ad Rotation Logic ---

  const adQueues = new WeakMap();
  let adRotationQueue = [];

  /**
   * Get the next ad for a container (per-container queue)
   * @param {HTMLElement} container
   * @param {string[]} banners
   * @returns {string}
   */
  function getNextAd(container, banners) {
    let queue = adQueues.get(container);
    if (!queue || queue.length === 0) {
      queue = shuffle([...banners]);
      adQueues.set(container, queue);
    }
    return queue.shift();
  }

  /**
   * Get the next ad in a global round-robin queue
   * @param {string[]} banners
   * @returns {string}
   */
  function getNextAdRoundRobin(banners) {
    if (!adRotationQueue.length) {
      adRotationQueue = shuffle([...banners]);
    }
    return adRotationQueue.shift();
  }

  // --- Ad Sending ---

  /**
   * Send an ad into a container, matching sibling styles and animating entry
   * @param {string[]} adHtmlArr
   * @param {HTMLElement} container
   * @param {boolean} isFirstLoad
   */
  function sendAd(adHtmlArr, container, isFirstLoad) {
    // Preset slot: send directly
    if (container.classList.contains('ad-send-banner') || container.id?.startsWith('banner-slot-')) {
      let adWrapper = container.querySelector('.ad-send-banner');
      if (!adWrapper) {
        adWrapper = document.createElement('div');
        adWrapper.className = 'ad-send-banner';
        adWrapper.style.width = '100%';
        adWrapper.style.height = '100%';
        adWrapper.style.display = 'flex';
        adWrapper.style.alignItems = 'center';
        adWrapper.style.justifyContent = 'center';
        adWrapper.style.overflow = 'hidden';
        adWrapper.style.minHeight = 'unset';
        adWrapper.style.maxHeight = 'unset';
        adWrapper.style.boxSizing = 'border-box';
        container.innerHTML = '';
        container.appendChild(adWrapper);
      }
      const slotRect = container.getBoundingClientRect();
      adWrapper.style.height = slotRect.height + 'px';
      adWrapper.style.maxHeight = slotRect.height + 'px';
      adWrapper.style.minHeight = slotRect.height + 'px';
      adWrapper.style.width = '100%';
      const adHtml = getNextAd(container, adHtmlArr);
      adWrapper.innerHTML = adHtml;
      const adContent = adWrapper.firstElementChild;
      if (adContent) {
        adContent.style.width = '100%';
        adContent.style.height = '100%';
        adContent.style.display = 'flex';
        adContent.style.alignItems = 'center';
        adContent.style.justifyContent = 'center';
        adContent.style.overflow = 'hidden';
        adContent.style.boxSizing = 'border-box';
      }
      const imgs = adWrapper.querySelectorAll('img');
      imgs.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        img.style.margin = '0';
        img.style.boxSizing = 'border-box';
      });
      const iframes = adWrapper.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';
      });
      return;
    }
    // Find children to determine insertion point
    let adWrapper = container.querySelector('.ad-send-banner');
    const children = Array.from(container.children).filter(
      (el) => !el.classList.contains('ad-send-banner')
    );
    if (children.length < 3) return;
    let idx;
    if (container.dataset.adIndex !== undefined) {
      idx = parseInt(container.dataset.adIndex, 10);
      if (isNaN(idx) || idx < 1 || idx >= children.length - 1) {
        idx = 1;
        container.dataset.adIndex = idx;
      }
    } else {
      const validIndexes = [];
      for (let i = 1; i < children.length - 1; i++) validIndexes.push(i);
      idx = validIndexes[Math.floor(Math.random() * validIndexes.length)];
      if (idx === undefined) return;
      container.dataset.adIndex = idx;
    }
    const refNode = children[idx];
    const refRect = refNode.getBoundingClientRect();
    const width = refRect.width;
    const height = refRect.height;
    if (!adWrapper) {
      adWrapper = document.createElement('div');
      adWrapper.className = 'ad-send-banner';
      adWrapper.style.width = width + 'px';
      adWrapper.style.height = height + 'px';
      adWrapper.style.display = 'flex';
      adWrapper.style.alignItems = 'center';
      adWrapper.style.justifyContent = 'center';
      adWrapper.style.overflow = 'hidden';
      adWrapper.style.minWidth = width + 'px';
      adWrapper.style.minHeight = height + 'px';
      adWrapper.style.maxWidth = width + 'px';
      adWrapper.style.maxHeight = height + 'px';
      if (refNode.nextSibling) {
        container.insertBefore(adWrapper, refNode.nextSibling);
      } else {
        container.appendChild(adWrapper);
      }
    } else {
      if (adWrapper.previousSibling !== refNode) {
        if (refNode.nextSibling) {
          container.insertBefore(adWrapper, refNode.nextSibling);
        } else {
          container.appendChild(adWrapper);
        }
      }
      adWrapper.style.width = width + 'px';
      adWrapper.style.height = height + 'px';
      adWrapper.style.minWidth = width + 'px';
      adWrapper.style.minHeight = height + 'px';
      adWrapper.style.maxWidth = width + 'px';
      adWrapper.style.maxHeight = height + 'px';
    }
    // --- Enhanced: Copy sibling element tags and styles up to selector ---
    let siblings = Array.from(container.children).filter(
      el => el !== adWrapper && !el.classList.contains('ad-send-banner')
    );
    let adHtml = getNextAd(container, adHtmlArr);
    // Use bannerObj for wrapping if needed
    let bannerObj = null;
    if (copySiblingSelector) {
      // Find the closest matching sibling (not inside adWrapper)
      let customRef = container.querySelector(copySiblingSelector);
      if (customRef) {
        // Clone the tag and all computed styles
        const clone = customRef.cloneNode(false); // shallow clone
        const refStyle = window.getComputedStyle(customRef);
        for (let i = 0; i < refStyle.length; i++) {
          const prop = refStyle[i];
          clone.style.setProperty(prop, refStyle.getPropertyValue(prop), refStyle.getPropertyPriority(prop));
        }
        clone.className = customRef.className;
        clone.id = customRef.id ? customRef.id + '-ad' : '';
        // Find the banner object for this adHtml
        if (banners && banners.length && window._adConfigBanners) {
          bannerObj = window._adConfigBanners.find(b => adHtml.includes(b.imageUrl));
        }
        if (bannerObj && bannerObj.targetUrl) {
          clone.innerHTML = `<a href="${bannerObj.targetUrl}" target="_blank" rel="noopener noreferrer">${adHtml}</a>`;
        } else {
          clone.innerHTML = adHtml;
        }
        adWrapper.innerHTML = '';
        adWrapper.appendChild(clone);
        siblings = [customRef];
      }
    } else {
      replicateSiblingStyles(adWrapper, siblings);
      adWrapper.innerHTML = adHtml;
    }
    // ...existing code for images/iframes/animation...
    const adContent = adWrapper.firstElementChild;
    if (adContent) {
      adContent.style.width = '100%';
      adContent.style.height = '100%';
      adContent.style.display = 'flex';
      adContent.style.alignItems = 'center';
      adContent.style.justifyContent = 'center';
      adContent.style.overflow = 'hidden';
      adContent.style.boxSizing = 'border-box';
    }
    const imgs = adWrapper.querySelectorAll('img');
    imgs.forEach(img => {
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.display = 'block';
      img.style.margin = '0';
      img.style.boxSizing = 'border-box';
    });
    const iframes = adWrapper.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.display = 'block';
    });
    animateAdEntry(adWrapper, refNode);
  }

  // --- Banner Fetching & Rotation ---

  let banners = [];
  let bannerIndex = 0;
  let containerSelectors = [];
  let rotationOffset = Math.floor(Math.random() * 1000);

  /**
   * Fetch all banners and container selectors for the current page from ad-config.json
   * Also loads copySiblingSelector for style replication.
   */
  let copySiblingSelector = null;
  async function fetchAllBannersFromFile() {
    try {
      const configUrl = 'http://127.0.0.1:5500/js/ad-config.json';
      const res = await fetch(configUrl);
      if (!res.ok) return;
      const configs = await res.json();
      // Find the property config by propertyId
      const config = Array.isArray(configs)
        ? configs.find(cfg => cfg.property_id === propertyId)
        : null;
      if (!config) return;
      // Expose banners for sendAd to use
      window._adConfigBanners = config.banners || [];
      // Match by current page URL (ignoring query/hash)
      const pageUrl = window.location.origin + window.location.pathname;
      if (config.url && !pageUrl.startsWith(config.url)) return;
      containerSelectors = Array.isArray(config.containers) ? config.containers : [];
      if (containerSelectors.length && typeof containerSelectors[0] === 'object' && containerSelectors[0].name) {
        containerSelectors = containerSelectors.map(c => c.name).filter(Boolean);
      }
      banners = (config.banners || []).map(b => {
        if (b.imageUrl && b.targetUrl) {
          // Add animation class to the image only
          return `<a href="${b.targetUrl}" target="_blank" rel="noopener noreferrer"><img src="${b.imageUrl}" alt="ad" class="ad-img-anim" style="max-width:100%;height:auto;display:block;" /></a>`;
        } else if (b.imageUrl) {
          return `<img src="${b.imageUrl}" alt="ad" class="ad-img-anim" style="max-width:100%;height:auto;display:block;" />`;
        }
        return '';
      }).filter(Boolean);
      copySiblingSelector = config.copySiblingSelector || null;
      bannerIndex = 0;
      rotationOffset = Math.floor(Math.random() * 1000);
    } catch (e) {
      console.error('[AdSend] Failed to load ad-config.json:', e);
    }
  }

  /**
   * Rotate ads in all slots (fair, round-robin)
   */
  function rotateAdSlots() {
    if (!banners.length) return;
    if (!containerSelectors.length) {
      console.error('[ad-injector] No container selectors found for this page. Please define at least one container/selector.');
      return;
    }
    let allContainers = [];
    containerSelectors.forEach(selector => {
      allContainers = allContainers.concat(Array.from(document.querySelectorAll(selector)));
    });
    if (!allContainers.length) return;
    const shuffledContainers = shuffle([...allContainers]);
    shuffledContainers.forEach((container) => {
      sendAd(banners, container, false);
    });
  }

  // --- Initialization ---

  const script = document.currentScript;
  const propertyId = script.getAttribute("data-property");
  if (!propertyId) return;

  (async function initAdInjector() {
    await fetchAllBannersFromFile();
    if (!containerSelectors.length) {
      console.error('[AdSend] No container selectors found for this page. Please define at least one container/selector in ad-config.json.');
      return;
    }
    let allContainers = [];
    containerSelectors.forEach(selector => {
      const containers = Array.from(document.querySelectorAll(selector));
      allContainers = allContainers.concat(containers);
    });
    if (banners.length && allContainers.length) {
      allContainers = shuffle(allContainers);
      allContainers.forEach((el) => {
        sendAd(banners, el, true);
      });
    }
    if (banners.length > 1) {
      setInterval(rotateAdSlots, 10000);
      setInterval(fetchAllBannersFromFile, 5 * 60 * 1000);
    }
  })();

  // --- Animation CSS Injection ---

  (function addAdAnimations(){
    if (document.getElementById('ad-injector-animations')) return;
    const style = document.createElement('style');
    style.id = 'ad-injector-animations';
    style.textContent = `
    .ad-flip-in { animation: adFlipIn 0.7s cubic-bezier(.4,2,.6,1) both; }
    .ad-bounce-in { animation: adBounceIn 0.7s cubic-bezier(.4,2,.6,1) both; }
    .ad-fade-in { animation: adFadeIn 0.7s cubic-bezier(.4,2,.6,1) both; }
    .ad-slide-in { animation: adSlideIn 0.7s cubic-bezier(.4,2,.6,1) both; }
    .ad-img-anim { animation: adImgFadeIn 0.7s cubic-bezier(.4,2,.6,1) both; }
    .ad-send-banner { /* replaces .ad-injected-banner for send ads */ }
    @keyframes adFlipIn {
      0% { transform: rotateY(90deg) scale(0.8); opacity: 0; }
      60% { transform: rotateY(-10deg) scale(1.05); opacity: 1; }
      80% { transform: rotateY(5deg) scale(0.98); }
      100% { transform: none; opacity: 1; }
    }
    @keyframes adBounceIn {
      0% { transform: scale(0.5) translateY(60px); opacity: 0; }
      60% { transform: scale(1.1) translateY(-10px); opacity: 1; }
      80% { transform: scale(0.95) translateY(2px); }
      100% { transform: none; opacity: 1; }
    }
    @keyframes adFadeIn {
      0% { opacity: 0; transform: scale(0.95); }
      100% { opacity: 1; transform: none; }
    }
    @keyframes adSlideIn {
      0% { opacity: 0; transform: translateY(40px) scale(0.98); }
      80% { opacity: 1; transform: translateY(-4px) scale(1.01); }
      100% { opacity: 1; transform: none; }
    }
    @keyframes adImgFadeIn {
      0% { opacity: 0; filter: blur(8px); }
      100% { opacity: 1; filter: none; }
    }
    `;
    document.head.appendChild(style);
  })();
})();