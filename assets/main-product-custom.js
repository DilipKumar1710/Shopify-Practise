document.addEventListener("DOMContentLoaded", () => {

  const product = window.productData;
  const variants = product.variants;

  let selectedOptions = new Array(product.options.length).fill(null);

  const buttons = document.querySelectorAll('.option-btn');
  const addToCartBtn = document.getElementById('add-to-cart');

  const stickyBar = document.getElementById('sticky-atc');
  const mainAtc = document.querySelector('[data-main-atc]');
  const stickyBtn = document.getElementById('sticky-add-to-cart');

  const stickyVariantEl = document.getElementById('sticky-variant');
  const stickyPriceEl = document.getElementById('sticky-price');
  const productPrice = document.getElementById('product-price');

  initializeVariant();

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {

      const index = parseInt(btn.dataset.optionIndex);
      const value = btn.dataset.value;

      selectedOptions[index] = value;

      document.querySelectorAll(`[data-option-index="${index}"]`)
        .forEach(b => b.classList.remove('selected'));

      btn.classList.add('selected');

      updateAvailability();
      updateVariant();
    });
  });

  function initializeVariant() {

    const urlParams = new URLSearchParams(window.location.search);
    const variantIdFromUrl = urlParams.get('variant');

    let initialVariant = null;

    if (variantIdFromUrl) {
      initialVariant = variants.find(v => v.id == variantIdFromUrl);
    }

    if (!initialVariant) {
      initialVariant = variants.find(v => v.available);
    }

    if (!initialVariant) {
      initialVariant = variants[0];
    }

    selectedOptions = [...initialVariant.options];

    updateSelectedUI();
    updateAvailability();
    updateVariant();
  }

  function updateSelectedUI() {

    buttons.forEach(btn => {

      const index = parseInt(btn.dataset.optionIndex);
      const value = btn.dataset.value;

      if (selectedOptions[index] === value) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }

    });

  }

  function isOptionAvailable(optionIndex, value) {

    return variants.some(variant => {

      if (!variant.available) return false;

      return variant.options.every((opt, i) => {
        if (i === optionIndex) return opt === value;
        if (selectedOptions[i] === null) return true;
        return opt === selectedOptions[i];
      });

    });

  }

  function updateAvailability() {

    buttons.forEach(btn => {

      const index = parseInt(btn.dataset.optionIndex);
      const value = btn.dataset.value;

      if (isOptionAvailable(index, value)) {
        btn.classList.remove('disabled');
      } else {
        btn.classList.add('disabled');
      }

    });

  }

  function findMatchingVariant() {
    return variants.find(variant =>
      variant.options.every((opt, i) => opt === selectedOptions[i])
    );
  }

  function updateVariant() {

    const variant = findMatchingVariant();

    updateText();
    
    if (variant && stickyPriceEl){
      productPrice.innerText = formatMoney(variant.price);
    }

    if (variant) {

      addToCartBtn.disabled = !variant.available;

      document.getElementById('variant-id').value = variant.id;

      window.history.replaceState({}, '', `?variant=${variant.id}`);

      if (variant.featured_image) {
        document.getElementById('main-product-image').src =
          variant.featured_image.src;
      }

    } else {
      addToCartBtn.disabled = true;
    }

  
    if (stickyVariantEl) {
      stickyVariantEl.innerText =
        product.options.map((opt, i) => `${opt}: ${selectedOptions[i]}`).join(' — ');
    }

    if (variant && stickyPriceEl) {
      stickyPriceEl.innerText = formatMoney(variant.price);
    }

    if (stickyBtn && variant) {
      stickyBtn.disabled = !variant.available;
    }
  }


  function updateText() {

    let text = product.options.map((opt, i) => {
      return `${opt}: ${selectedOptions[i] || '-'}`;
    }).join(' — ');

    document.getElementById('selected-variant').innerText = text;
  }

  document.getElementById('product-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const variantId = document.getElementById('variant-id').value;

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: variantId,
        quantity: 1
      })
    })
    .then(res => res.json())
    .then(() => {
      alert("Added to cart");
    });
  });

  if (stickyBtn) {
    stickyBtn.addEventListener('click', () => {

      const variantId = document.getElementById('variant-id').value;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: variantId,
          quantity: 1
        })
      })
      .then(res => res.json())
      .then(() => {
        alert('Added to cart');
      });

    });
  }

  if (stickyBar && mainAtc) {

    const observer = new IntersectionObserver(
      ([entry]) => {
        stickyBar.classList.toggle('show', !entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(mainAtc);
  }

  function formatMoney(cents) {
    return (cents / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  }

});