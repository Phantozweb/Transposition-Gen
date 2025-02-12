// Utility functions
const formatNum = num => {
  const numValue = Number(num);
  if (numValue === 0) return '0.00';
  const formatted = numValue.toFixed(2);
  return numValue > 0 ? `+${formatted}` : formatted;
};

const generateSphere = () => {
  const steps = 81; // -10.00 to +10.00 in 0.25 steps
  return (-10 + Math.floor(Math.random() * steps) * 0.25).toFixed(2);
};

const generatePlusCyl = () => {
  const steps = 24; // +0.25 to +6.00 in 0.25 steps
  return (0.25 + Math.floor(Math.random() * steps) * 0.25).toFixed(2);
};

const generateMinusCyl = () => {
  const steps = 25; // -6.00 to 0.00 in 0.25 steps
  return (-6 + Math.floor(Math.random() * steps) * 0.25).toFixed(2);
};

const generateAxis = () => Math.floor(Math.random() * 37) * 5; // 5° steps

// Conversion functions
function toMinusCylinder({ sphere, cylinder, axis }) {
  const newSphere = parseFloat((parseFloat(sphere) + parseFloat(cylinder)).toFixed(2));
  return {
    sphere: newSphere,
    cylinder: -parseFloat(cylinder),
    axis: (parseInt(axis) + 90) % 180
  };
}

function toPlusCylinder({ sphere, cylinder, axis }) {
  const newSphere = parseFloat((parseFloat(sphere) + parseFloat(cylinder)).toFixed(2));
  return {
    sphere: newSphere,
    cylinder: -parseFloat(cylinder).toFixed(2),
    axis: (parseInt(axis) - 90 + 180) % 180
  };
}

function sphericalEquivalent({ sphere, cylinder }) {
  return parseFloat((parseFloat(sphere) + parseFloat(cylinder)/2).toFixed(2));
}

function crossCylinder({ sphere, cylinder, axis }) {
  const convertedAxis = (parseInt(axis) + 90) % 180;
  const cross1 = parseFloat(sphere);
  const cross2 = parseFloat(sphere) + parseFloat(cylinder);
  
  return [
    { sphere: 0, cylinder: cross1, axis: convertedAxis },
    { sphere: 0, cylinder: cross2, axis: axis }
  ];
}

// Example generators
function createExampleHTML(original, converted, description) {
  return `
    <div class="card">
      <div class="prescription">
        ${formatRx(original)}<br>
        → ${description}: ${formatRx(converted)}
      </div>
    </div>
  `;
}

function formatRx(rx) {
  if ('baseCurve' in rx) {
    return `B.C=${rx.baseCurve} ${formatNum(rx.sphere)}/${formatNum(rx.cylinder)}×${rx.axis}`;
  }
  if (rx.cylinder === 0) return `${formatNum(rx.sphere)}DS`;
  if (rx.sphere === 0) return `${formatNum(rx.cylinder)}×${rx.axis}`;
  return `${formatNum(rx.sphere)}/${formatNum(rx.cylinder)}×${rx.axis}`;
}

// Category generators
function generateMinusCylinder() {
  const examples = Array.from({ length: 10 }, () => {
    const original = {
      sphere: generateSphere(),
      cylinder: generatePlusCyl(),
      axis: generateAxis()
    };
    return createExampleHTML(original, toMinusCylinder(original), 'Minus Cyl');
  }).join('');
  document.getElementById('minus-cyl-examples').innerHTML = examples;
}

function generatePlusCylinder() {
  const examples = Array.from({ length: 10 }, () => {
    const original = {
      sphere: generateSphere(),
      cylinder: generateMinusCyl(),
      axis: generateAxis()
    };
    return createExampleHTML(original, toPlusCylinder(original), 'Plus Cyl');
  }).join('');
  document.getElementById('plus-cyl-examples').innerHTML = examples;
}

function generateSphericalEquiv() {
  const examples = Array.from({ length: 10 }, () => {
    const original = {
      sphere: generateSphere(),
      cylinder: generateMinusCyl(),
      axis: null
    };
    const se = sphericalEquivalent(original);
    return `
      <div class="card">
        <div class="prescription">
          ${formatRx(original)}<br>
          → SE: ${formatNum(se)}DS
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('se-examples').innerHTML = examples;
}

function generateCrossCylinder() {
  const examples = Array.from({ length: 10 }, () => {
    const original = {
      sphere: generateSphere(),
      cylinder: generateMinusCyl(),
      axis: generateAxis()
    };
    const [cyl1, cyl2] = crossCylinder(original);
    return `
      <div class="card">
        <div class="prescription">
          ${formatRx(original)}<br>
          → ${formatRx(cyl1)}<br>
          → ${formatRx(cyl2)}
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('cross-cyl-examples').innerHTML = examples;
}

function generateToric() {
  const examples = Array.from({ length: 10 }, () => {
    const sphere = (-10 + Math.floor(Math.random() * 81) * 0.25).toFixed(2);
    const cylinder = (-6 + Math.floor(Math.random() * 25) * 0.25).toFixed(2);
    const axis = Math.floor(Math.random() * 37) * 5;
    const baseCurve = (-8 + Math.floor(Math.random() * 21) * 0.25).toFixed(2);

    const original = {
      sphere: parseFloat(sphere),
      cylinder: parseFloat(cylinder),
      axis: axis,
      baseCurve: parseFloat(baseCurve)
    };

    const toricSphere = parseFloat((original.sphere - original.baseCurve).toFixed(2));
    const toricCylinder = parseFloat((original.cylinder + original.baseCurve).toFixed(2));
    const toricAxis = original.axis;
    const powerAxis = (original.axis + 90) % 180;

    return `
      <div class="card">
        <div class="prescription">
          ${formatRx(original)} (B.C=${original.baseCurve.toFixed(2)})<br>
          → ${formatNum(toricSphere)}DS÷${original.baseCurve}×${powerAxis}/${formatNum(toricCylinder)}×${toricAxis}
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('toric-examples').innerHTML = examples;
}

// Enhanced tab switching with smooth transitions
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const activeTab = document.querySelector('.tab.active');
    const activeContent = document.querySelector('.tab-content.active');
    
    if (activeTab !== tab) {
      activeContent.style.animation = 'fadeSlideUp 0.3s reverse';
      
      setTimeout(() => {
        activeTab.classList.remove('active');
        activeContent.classList.remove('active');
        activeContent.style.animation = '';
        
        tab.classList.add('active');
        const newContent = document.getElementById(tab.dataset.tab);
        newContent.classList.add('active');
        newContent.style.animation = 'fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      }, 200);
    }
  });
});

// Add hover effect to cards
document.addEventListener('mousemove', function(e) {
  document.querySelectorAll('.card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
      const xPercent = ((x / rect.width) - 0.5) * 20;
      const yPercent = ((y / rect.height) - 0.5) * 20;
      card.style.transform = `
        translateY(-6px)
        scale(1.02)
        rotateX(${-yPercent}deg)
        rotateY(${xPercent}deg)
      `;
    } else {
      card.style.transform = '';
    }
  });
});

// Enhance regenerate buttons with loading state
document.querySelectorAll('.regenerate-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    this.style.opacity = '0.7';
    this.textContent = 'Generating...';
    
    setTimeout(() => {
      this.style.opacity = '1';
      this.textContent = 'Generate New Examples';
    }, 500);
  });
});

// Initial generation with staggered animation
window.addEventListener('load', () => {
  const functions = [
    generateMinusCylinder,
    generatePlusCylinder,
    generateSphericalEquiv,
    generateCrossCylinder,
    generateToric
  ];
  
  functions.forEach((fn, index) => {
    setTimeout(() => fn(), index * 100);
  });
});