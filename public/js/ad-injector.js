(function () {
  const script = document.currentScript;
  const propertyId = script.getAttribute("data-property");
  if (!propertyId) return;

  function shuffle(array) {
    let m = array.length,
      t,
      i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  const adQueues = new WeakMap();
  function getNextAd(container, banners) {
    let queue = adQueues.get(container);
    if (!queue || queue.length === 0) {
      queue = shuffle([...banners]);
      adQueues.set(container, queue);
    }
    return queue.shift();
  }

  function injectAd(adHtmlArr, container, isFirstLoad) {
    // If the container is a preset slot (e.g. #banner-slot-1), inject directly and skip child logic
    if (container.classList.contains('ad-injected-banner') || container.id?.startsWith('banner-slot-')) {
      let adWrapper = container.querySelector('.ad-injected-banner');
      if (!adWrapper) {
        adWrapper = document.createElement('div');
        adWrapper.className = 'ad-injected-banner';
        adWrapper.style.width = '100%';
        adWrapper.style.height = '100%';
        adWrapper.style.display = 'flex';
        adWrapper.style.alignItems = 'center';
        adWrapper.style.justifyContent = 'center';
        adWrapper.style.overflow = 'hidden';
        adWrapper.style.minHeight = 'unset'; // Remove minHeight
        adWrapper.style.maxHeight = 'unset'; // Remove maxHeight
        adWrapper.style.boxSizing = 'border-box';
        container.innerHTML = '';
        container.appendChild(adWrapper);
      }
      // Set wrapper height to match the slot's computed height
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
        img.style.objectFit = 'cover';
        img.style.display = 'block';
        img.style.margin = '8px';
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
    let adWrapper = container.querySelector('.ad-injected-banner');
    const children = Array.from(container.children).filter(
      (el) => !el.classList.contains('ad-injected-banner')
    );
    if (children.length < 3) return;
    let idx;
    if (container.dataset.adIndex !== undefined) {
      idx = parseInt(container.dataset.adIndex, 10);
      if (isNaN(idx) || idx < 1 || idx >= children.length - 1) {
        // fallback to first valid index if corrupted
        idx = 1;
        container.dataset.adIndex = idx;
      }
    } else {
      // Only randomize on first load
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
      adWrapper.className = 'ad-injected-banner';
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
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      img.style.margin = '8px';
      img.style.boxSizing = 'border-box';
    });
    const iframes = adWrapper.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.display = 'block';
    });
  }

  function getCurrentPageUrl() {
    // Use the full URL for matching
    return window.location.href;
  }

  let banners = [];
  let bannerIndex = 0;
  let containerSelectors = [];
  let rotationOffset = Math.floor(Math.random() * 1000); // randomize initial offset for fairness

  async function fetchAllBanners() {
    const url = encodeURIComponent(getCurrentPageUrl());
    const apiBase = window.location.origin;
    const res = await fetch(`${apiBase}/api/properties/${propertyId}/pages/by-url?url=${url}&withBanners=1`);
    if (!res.ok) return;
    const data = await res.json();
    banners = (data.banners || []).map(b => b.ad_html || b.adHtml).filter(Boolean);
    containerSelectors = Array.isArray(data.containers)
      ? data.containers.map(c => c.name).filter(Boolean)
      : [];
    bannerIndex = 0;
    rotationOffset = Math.floor(Math.random() * 1000); // re-randomize on refresh
  }

  function rotateAdSlots() {
    if (!banners.length) return;
    if (!containerSelectors.length) {
      console.error('[ad-injector] No container selectors found for this page. Please define at least one container/selector.');
      return;
    }
    // Gather all containers from all selectors
    let allContainers = [];
    containerSelectors.forEach(selector => {
      allContainers = allContainers.concat(Array.from(document.querySelectorAll(selector)));
    });
    if (!allContainers.length) return;
    // Shuffle containers for fairness
    const shuffledContainers = shuffle([...allContainers]);
    // Round-robin assign banners to containers, offset by rotationOffset
    shuffledContainers.forEach((container, i) => {
      const adIdx = (rotationOffset + i) % banners.length;
      injectAd([banners[adIdx]], container, false);
    });
    // Increment offset for next rotation
    rotationOffset = (rotationOffset + 1) % banners.length;
  }

  (async function initAdInjector() {
    await fetchAllBanners();
    // Initial inject
    if (!containerSelectors.length) {
      console.error('[ad-injector] No container selectors found for this page. Please define at least one container/selector.');
      return;
    }
    let allContainers = [];
    containerSelectors.forEach(selector => {
      const containers = Array.from(document.querySelectorAll(selector));
      allContainers = allContainers.concat(containers);
    });
    if (banners.length && allContainers.length) {
      // Shuffle containers for fairness
      allContainers = shuffle(allContainers);
      allContainers.forEach((el, i) => {
        const adIdx = (rotationOffset + i) % banners.length;
        injectAd([banners[adIdx]], el, true);
      });
    }
    // Rotate locally every 10s
    setInterval(rotateAdSlots, 10000);
    // Optionally, refresh banners and selectors from server every 5 minutes
    setInterval(fetchAllBanners, 5 * 60 * 1000);
  })();
})();
