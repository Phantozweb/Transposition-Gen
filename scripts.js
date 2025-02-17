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

function crossToSpheroCylinder(cyl1, cyl2) {
  // Extract the parameters
  const cyl1Power = parseFloat(cyl1.cylinder);
  const cyl1Axis = parseInt(cyl1.axis);
  const cyl2Power = parseFloat(cyl2.cylinder);
  const cyl2Axis = parseInt(cyl2.axis);
  
  // Calculate sphere and cylinder
  const sphere = Math.min(cyl1Power, cyl2Power);
  const cylinder = Math.abs(cyl1Power - cyl2Power);
  const axis = cyl1Power < cyl2Power ? cyl2Axis : cyl1Axis;
  
  return {
    sphere: parseFloat(sphere.toFixed(2)),
    cylinder: parseFloat(cylinder.toFixed(2)),
    axis: axis
  };
}

// Example generators
function createExampleHTML(original, converted, description) {
  return `
    <div class="card">
      <div class="generator-question">
        <div class="prescription question">
          ${formatristolRx(original)}
        </div>
      </div>
      <div class="generator-answer">
        <div class="prescription answer">
          ${formatristolRx(converted)}
        </div>
      </div>
    </div>
  `;
}

function formatristolRx(rx) {
  if ('baseCurve' in rx) {
    return `${formatNum(rx.sphere)}/${formatNum(rx.cylinder)}×${rx.axis} (B.C=${rx.baseCurve.toFixed(2)})`;
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
        <div class="generator-question">
          <div class="prescription question">
            ${formatristolRx(original)}
          </div>
        </div>
        <div class="generator-answer">
          <div class="prescription answer">
            SE: ${formatNum(se)}DS
          </div>
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
        <div class="generator-question">
          <div class="prescription question">
            ${formatristolRx(original)}
          </div>
        </div>
        <div class="generator-answer">
          <div class="prescription answer">
            ${formatristolRx(cyl1)}<br>
            ${formatristolRx(cyl2)}
          </div>
          ${generateOpticCross({
            vertical: {
              power: cyl1.cylinder,
              axis: cyl1.axis
            },
            horizontal: {
              power: cyl2.cylinder,
              axis: cyl2.axis
            }
          })}
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('cross-cyl-examples').innerHTML = examples;
}

function generateCrossToSphero() {
  const examples = Array.from({ length: 10 }, () => {
    // Generate two cross cylinders
    const cyl1Power = (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2);
    const axis1 = Math.floor(Math.random() * 37) * 5;
    const cyl2Power = (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2);
    const axis2 = (axis1 + 90) % 180;
    
    const cross1 = {
      sphere: 0,
      cylinder: parseFloat(cyl1Power),
      axis: axis1
    };
    
    const cross2 = {
      sphere: 0,
      cylinder: parseFloat(cyl2Power),
      axis: axis2
    };
    
    // Calculate both possible answers
    const answer1 = crossToSpheroCylinder(cross1, cross2);
    const answer2 = {
      sphere: answer1.sphere + answer1.cylinder,
      cylinder: -answer1.cylinder,
      axis: (answer1.axis + 90) % 180
    };
    
    return `
      <div class="card">
        <div class="generator-question">
          <div class="prescription question">
            ${formatristolRx(cross1)}<br>
            ${formatristolRx(cross2)}
          </div>
        </div>
        <div class="generator-answer">
          <div class="prescription answer">
            ${formatristolRx(answer1)}<br>
            or<br>
            ${formatristolRx(answer2)}
          </div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('cross-to-sphero-examples').innerHTML = examples;
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
        <div class="generator-question">
          <div class="prescription question">
            ${formatristolRx(original)}
          </div>
        </div>
        <div class="generator-answer">
          <div class="prescription answer">
            ${formatNum(toricSphere)}DS÷${formatNum(original.baseCurve)}×${powerAxis}/${formatNum(toricCylinder)}×${toricAxis}
          </div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('toric-examples').innerHTML = examples;
}

function generateOpticCrossExamples() {
  const examples = Array.from({ length: 10 }, () => {
    const power1 = (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2);
    const axis1 = Math.floor(Math.random() * 180);
    
    const power2 = (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2);
    const axis2 = (axis1 + 90) % 180;
    
    const vertical = {
      power: power1,
      axis: axis1
    };
    
    const horizontal = {
      power: power2,
      axis: axis2
    };
    
    const sphere = Math.min(parseFloat(power1), parseFloat(power2));
    const cylinder = Math.abs(parseFloat(power1) - parseFloat(power2));
    const finalAxis = parseFloat(power1) < parseFloat(power2) ? axis2 : axis1;
    
    const answer1 = {
      sphere: parseFloat(sphere.toFixed(2)),
      cylinder: parseFloat(cylinder.toFixed(2)),
      axis: finalAxis
    };
    
    const answer2 = {
      sphere: answer1.sphere + answer1.cylinder,
      cylinder: -answer1.cylinder,
      axis: (answer1.axis + 90) % 180
    };
    
    const opticCrossData = {
      vertical,
      horizontal
    };

    return `
      <div class="card">
        <div class="generator-question">
          <div class="prescription question">
            <span style="color: #4CAF50">Vertical: ${formatNum(vertical.power)}@${vertical.axis}°</span><br>
            <span style="color: #F44336">Horizontal: ${formatNum(horizontal.power)}@${horizontal.axis}°</span>
          </div>
          ${generateOpticCross(opticCrossData)}
        </div>
        <div class="generator-answer">
          <div class="prescription answer">
            ${formatristolRx(answer1)}<br>
            or<br>
            ${formatristolRx(answer2)}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('optic-cross-examples').innerHTML = examples;
}

function generateOpticCross({ vertical, horizontal }) {
  const centerX = 100;
  const centerY = 100;
  const length = 80; 

  const verticalRad = (vertical.axis * Math.PI) / 180;
  const horizontalRad = (horizontal.axis * Math.PI) / 180;

  const verticalX1 = centerX + length * Math.sin(verticalRad);
  const verticalY1 = centerY - length * Math.cos(verticalRad);
  const verticalX2 = centerX - length * Math.sin(verticalRad);
  const verticalY2 = centerY + length * Math.cos(verticalRad);

  const horizontalX1 = centerX + length * Math.sin(horizontalRad);
  const horizontalY1 = centerY - length * Math.cos(horizontalRad);
  const horizontalX2 = centerX - length * Math.sin(horizontalRad);
  const horizontalY2 = centerY + length * Math.cos(horizontalRad);

  return `
    <svg class="optic-cross" viewBox="0 0 200 200">
      <line 
        x1="${verticalX1}" 
        y1="${verticalY1}" 
        x2="${verticalX2}" 
        y2="${verticalY2}" 
        stroke="#4CAF50" 
        stroke-width="3"
      />
      <line 
        x1="${horizontalX1}" 
        y1="${horizontalY1}" 
        x2="${horizontalX2}" 
        y2="${horizontalY2}" 
        stroke="#F44336" 
        stroke-width="3"
      />
    </svg>
  `;
}

// Quiz functionality
let currentQuestion = null;
let score = 0;
let totalAttempts = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let skippedAnswers = 0;
let timerInterval;

function startTimer(seconds) {
  clearInterval(timerInterval);
  
  // Remove existing timer element
  const existingTimer = document.getElementById('question-timer');
  if (existingTimer) existingTimer.remove();

  // Create and add new timer element
  const timerDiv = document.createElement('div');
  timerDiv.className = 'timer';
  timerDiv.id = 'question-timer';
  
  // Insert timer after feedback element
  const feedback = document.getElementById('feedback');
  if (feedback.nextSibling) {
    feedback.parentNode.insertBefore(timerDiv, feedback.nextSibling);
  } else {
    feedback.parentNode.appendChild(timerDiv);
  }

  let timeLeft = seconds;
  
  const updateTimer = () => {
    if (timeLeft < 0) {
      clearInterval(timerInterval);
      timerDiv.remove();
      displayQuizQuestion();
      return;
    }

    timerDiv.textContent = `Next question in ${timeLeft} seconds`;
    timerDiv.classList.toggle('warning', timeLeft <= 5);
    timeLeft--;
  };
  
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateScoreDisplay() {
  document.getElementById('score-details').innerHTML = `
    <div class="score-item correct">Correct: ${correctAnswers}</div>
    <div class="score-item incorrect">Incorrect: ${incorrectAnswers}</div>
    <div class="score-item skipped">Skipped: ${skippedAnswers}</div>
    <div class="score-item total">Total: ${totalAttempts}</div>
  `;
}

function generateQuizQuestion() {
  const questionTypes = [
    'plusCylinder',
    'minusCylinder',
    'sphericalEquivalent',
    'crossCylinder',
    'crossToSphero', 
    'toric',
    'opticCross'
  ];
  
  const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  let question, answer;
  
  switch(type) {
    case 'plusCylinder':
      const rxMinus = {
        sphere: generateSphere(),
        cylinder: generateMinusCyl(),
        axis: generateAxis()
      };
      question = {
        type: 'Plus Cylinder Conversion',
        rx: rxMinus,
        format: 'Convert to plus cylinder notation'
      };
      answer = toPlusCylinder(rxMinus);
      break;
      
    case 'minusCylinder':
      const rxPlus = {
        sphere: generateSphere(),
        cylinder: generatePlusCyl(),
        axis: generateAxis()
      };
      question = {
        type: 'Minus Cylinder Conversion',
        rx: rxPlus,
        format: 'Convert to minus cylinder notation'
      };
      answer = toMinusCylinder(rxPlus);
      break;
      
    case 'sphericalEquivalent':
      const rxSE = {
        sphere: (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2),
        cylinder: (-6 + Math.floor(Math.random() * 25) * 0.5).toFixed(2),
        axis: generateAxis()
      };
      question = {
        type: 'Spherical Equivalent',
        rx: rxSE,
        format: 'Calculate the spherical equivalent'
      };
      answer = sphericalEquivalent(rxSE);
      break;
      
    case 'crossCylinder':
      const rxCross = {
        sphere: generateSphere(),
        cylinder: generateMinusCyl(),
        axis: generateAxis()
      };
      question = {
        type: 'Convert to Cross Cylinders',
        rx: rxCross,
        format: 'Convert to crossed cylinder notation'
      };
      answer = crossCylinder(rxCross);
      break;
      
    case 'crossToSphero':
      const cyl1Power = (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2);
      const axis1 = generateAxis();
      const cyl2Power = (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2);
      const axis2 = (axis1 + 90) % 180;
      question = {
        type: 'Convert Cross Cylinders to Sphero-cylinder',
        rx: {
          cross1: { sphere: 0, cylinder: parseFloat(cyl1Power), axis: axis1 },
          cross2: { sphere: 0, cylinder: parseFloat(cyl2Power), axis: axis2 }
        },
        format: 'Convert crossed cylinders to sphero-cylinder notation'
      };
      answer = crossToSpheroCylinder(
        { sphere: 0, cylinder: parseFloat(cyl1Power), axis: axis1 },
        { sphere: 0, cylinder: parseFloat(cyl2Power), axis: axis2 }
      );
      break;
      
    case 'toric':
      const sphere = (-10 + Math.floor(Math.random() * 81) * 0.25).toFixed(2);
      const cylinder = (-6 + Math.floor(Math.random() * 25) * 0.25).toFixed(2);
      const axis = generateAxis();
      const baseCurve = (-8 + Math.floor(Math.random() * 21) * 0.25).toFixed(2);
      question = {
        type: 'Toric Transposition',
        rx: {
          sphere: parseFloat(sphere),
          cylinder: parseFloat(cylinder),
          axis: axis,
          baseCurve: parseFloat(baseCurve)
        },
        format: 'Calculate toric transposition'
      };
      answer = {
        sphere: parseFloat((parseFloat(sphere) - parseFloat(baseCurve)).toFixed(2)),
        cylinder: parseFloat((parseFloat(cylinder) + parseFloat(baseCurve)).toFixed(2)),
        axis: axis,
        baseCurve: parseFloat(baseCurve)
      };
      break;

    case 'opticCross':
      // Generate random cross cylinder values
      const verticalPower = (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2);
      const verticalAxis = Math.floor(Math.random() * 180);
      const horizontalPower = (-14 + Math.floor(Math.random() * 57) * 0.5).toFixed(2);
      const horizontalAxis = (verticalAxis + 90) % 180;

      question = {
        type: 'Optic Cross Conversion',
        opticCross: {
          vertical: { power: verticalPower, axis: verticalAxis },
          horizontal: { power: horizontalPower, axis: horizontalAxis }
        },
        format: 'Convert optic cross to sphero-cylinder'
      };
      
      answer = crossToSpheroCylinder(
        { cylinder: parseFloat(verticalPower), axis: verticalAxis },
        { cylinder: parseFloat(horizontalPower), axis: horizontalAxis }
      );
      break;
  }
  
  return { question, answer, type };
}

function formatAnswerExplanation(type, answer) {
  switch(type) {
    case 'plusCylinder':
    case 'minusCylinder':
      return formatristolRx(answer);
      
    case 'sphericalEquivalent':
      return `${formatNum(answer)}DS`;
      
    case 'crossCylinder':
      return `${formatristolRx(answer[0])} / ${formatristolRx(answer[1])}`;
      
    case 'crossToSphero':
    case 'opticCross':  
      const answer2 = {
        sphere: answer.sphere + answer.cylinder,
        cylinder: -answer.cylinder,
        axis: (answer.axis + 90) % 180
      };
      return `${formatristolRx(answer)} or ${formatristolRx(answer2)}`;
      
    case 'toric':
      return `${formatNum(answer.sphere)}DS÷${formatNum(answer.baseCurve)}×${(answer.axis + 90) % 180}/${formatNum(answer.cylinder)}×${answer.axis}`;
  }
}

function checkAnswer() {
  const submitBtn = document.getElementById('check-answer');
  const revealBtn = document.getElementById('reveal-answer');

  submitBtn.disabled = true;
  revealBtn.disabled = true;

  const userAnswer = document.getElementById('user-answer').value.trim();

  // Handle empty answer as skip
  if (!userAnswer) {
    skippedAnswers++;
    totalAttempts++;
    updateScoreDisplay();
    
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = `<div>Question skipped</div>`;
    feedback.className = 'feedback skipped';
    
    revealAnswer();
    return;
  }

  let isCorrect = false;
  
  switch(currentQuestion.type) {
    case 'plusCylinder':
    case 'minusCylinder':
      const parsed = parseRx(userAnswer);
      isCorrect = compareRx(parsed, currentQuestion.answer);
      break;
      
    case 'sphericalEquivalent':
      const userSE = parseFloat(userAnswer.replace('DS', ''));
      isCorrect = Math.abs(userSE - currentQuestion.answer) < 0.01;
      break;
      
    case 'crossCylinder':
      const crossAnswers = currentQuestion.answer;
      const userCrosses = userAnswer.split('/').map(rx => parseRx(rx.trim()));
      isCorrect = userCrosses.length === 2 &&
                 compareRx(userCrosses[0], crossAnswers[0]) &&
                 compareRx(userCrosses[1], crossAnswers[1]);
      break;
      
    case 'crossToSphero':
    case 'opticCross':  
      const parsedSphero = parseRx(userAnswer);
      const answer1 = currentQuestion.answer;
      const answer2 = {
        sphere: answer1.sphere + answer1.cylinder,
        cylinder: -answer1.cylinder,
        axis: (answer1.axis + 90) % 180
      };
      isCorrect = compareRx(parsedSphero, answer1) || compareRx(parsedSphero, answer2);
      break;
      
    case 'toric':
      const toricFormat = /^[+-]?\d+\.?\d*DS÷[+-]?\d+\.?\d*×\d+\/[+-]?\d+\.?\d*×\d+$/;
      isCorrect = toricFormat.test(userAnswer);
      break;
  }
  
  totalAttempts++;
  if (isCorrect) {
    correctAnswers++;
    score++;
  } else {
    incorrectAnswers++;
  }
  
  updateScoreDisplay();
  
  const feedback = document.getElementById('feedback');
  feedback.innerHTML = `
    <div>${isCorrect ? 'Correct!' : 'Incorrect.'}</div>
    ${!isCorrect ? `<div class="feedback-details">${analyzeAnswer(userAnswer, currentQuestion.answer, currentQuestion.type)}</div>` : ''}
  `;
  feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  
  if (!isCorrect || !userAnswer) {
    revealAnswer();
    startTimer(15); // Start 15 second timer for incorrect answers
  } else {
    document.getElementById('next-question').style.display = 'block';
    startTimer(2); // Start 2 second timer for correct answers
  }
  
  document.getElementById('answer-reveal').classList.remove('visible');
}

function revealAnswer() {
  const revealBtn = document.getElementById('reveal-answer');
  const submitBtn = document.getElementById('check-answer');

  revealBtn.disabled = true;
  submitBtn.disabled = true;

  // If no answer was submitted, count as skip
  if (!document.getElementById('feedback').textContent) {
    skippedAnswers++;
    totalAttempts++;
    updateScoreDisplay();
    
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = `<div>Question skipped</div>`;
    feedback.className = 'feedback skipped';
  }

  const answerReveal = document.getElementById('answer-reveal');
  answerReveal.textContent = `Correct answer: ${formatAnswerExplanation(currentQuestion.type, currentQuestion.answer)}`;
  answerReveal.classList.add('visible');

  // Start the 15-second timer
  startTimer(15);
}

function analyzeAnswer(userAnswer, correctAnswer, type) {
  let details = '';
  
  switch(type) {
    case 'plusCylinder':
    case 'minusCylinder':
      const parsed = parseRx(userAnswer);
      if (parsed) {
        if (Math.abs(parsed.sphere - correctAnswer.sphere) > 0.01) {
          details += `Sphere value is incorrect. You entered ${formatNum(parsed.sphere)}, should be ${formatNum(correctAnswer.sphere)}. `;
        }
        if (Math.abs(parsed.cylinder - correctAnswer.cylinder) > 0.01) {
          details += `Cylinder value is incorrect. You entered ${formatNum(parsed.cylinder)}, should be ${formatNum(correctAnswer.cylinder)}. `;
        }
        if (parsed.axis !== correctAnswer.axis && Math.abs(parsed.axis - correctAnswer.axis) !== 180) {
          details += `Axis is incorrect. You entered ${parsed.axis}°, should be ${correctAnswer.axis}°. `;
        }
      } else {
        details = 'Invalid format. Use format: sphere/cylinder×axis (e.g. +1.25/-2.00×180)';
      }
      break;
      
    case 'sphericalEquivalent':
      const userSE = parseFloat(userAnswer.replace('DS', ''));
      if (isNaN(userSE)) {
        details = 'Invalid format. Enter a number followed by DS (e.g. +1.50DS)';
      } else {
        details = `Your answer: ${formatNum(userSE)}DS, Correct answer: ${formatNum(correctAnswer)}DS`;
      }
      break;
      
    // Add similar analysis for other question types...
  }
  
  return details || 'Check your format and values carefully.';
}

function parseRx(rxString) {
  const regex = /([+-]?\d+\.?\d*)(?:\/([+-]?\d+\.?\d*)×(\d+))?/;
  const matches = rxString.match(regex);
  
  if (!matches) return null;
  
  return {
    sphere: parseFloat(matches[1]),
    cylinder: matches[2] ? parseFloat(matches[2]) : 0,
    axis: matches[3] ? parseInt(matches[3]) : 0
  };
}

function compareRx(rx1, rx2) {
  if (!rx1 || !rx2) return false;
  return Math.abs(rx1.sphere - rx2.sphere) < 0.01 &&
         Math.abs(rx1.cylinder - rx2.cylinder) < 0.01 &&
         (rx1.axis === rx2.axis || Math.abs(rx1.axis - rx2.axis) === 180);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quiz')) {
    displayQuizQuestion();
    
    const debouncedCheckAnswer = debounce(checkAnswer, 300);
    document.getElementById('check-answer').addEventListener('click', debouncedCheckAnswer);
    document.getElementById('reveal-answer').addEventListener('click', debounce(revealAnswer, 300));
    document.getElementById('next-question').addEventListener('click', displayQuizQuestion);
    
    const userAnswerInput = document.getElementById('user-answer');
    userAnswerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') debouncedCheckAnswer();
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quiz')) {
    displayQuizQuestion();
  }
});

document.querySelector('.tab-dropdown').addEventListener('change', function() {
  clearInterval(timerInterval);
  const existingTimer = document.getElementById('question-timer');
  if (existingTimer) {
    existingTimer.remove();
  }
  // ... rest of existing tab change code ...
});

document.querySelector('.tab-dropdown').addEventListener('change', function() {
  const activeContent = document.querySelector('.tab-content.active');
  activeContent.style.animation = 'fadeSlideUp 0.3s reverse';
  
  setTimeout(() => {
    activeContent.classList.remove('active');
    activeContent.style.animation = '';
    
    const newContent = document.getElementById(this.value);
    newContent.classList.add('active');
    newContent.style.animation = 'fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  }, 200);
});

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

window.addEventListener('load', () => {
  const functions = [
    generateMinusCylinder,
    generatePlusCylinder,
    generateSphericalEquiv,
    generateCrossCylinder,
    generateCrossToSphero,
    generateToric,
    generateOpticCrossExamples
  ];
  
  functions.forEach((fn, index) => {
    setTimeout(() => fn(), index * 100);
  });
});

document.querySelectorAll('.practice-quiz-btn').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.tab-dropdown').value = 'quiz';
    document.querySelector('.tab-dropdown').dispatchEvent(new Event('change'));
    
    document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const menuContent = document.querySelector('.menu-content');
  const closeMenu = document.querySelector('.close-menu');
  const menuOverlay = document.querySelector('.menu-overlay');

  function toggleMenu() {
    menuContent.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  }

  menuToggle.addEventListener('click', toggleMenu);
  closeMenu.addEventListener('click', toggleMenu);
  menuOverlay.addEventListener('click', toggleMenu);

  // Prevent menu content clicks from closing the menu
  menuContent.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Handle swipe to close menu on mobile
  let touchStartX = 0;
  let touchEndX = 0;

  menuContent.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  menuContent.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  function handleSwipe() {
    const swipeThreshold = 100;
    if (touchStartX - touchEndX > swipeThreshold) {
      toggleMenu();
    }
  }

  // Close menu on window resize
  window.addEventListener('resize', () => {
    if (menuContent.classList.contains('active')) {
      toggleMenu();
    }
  });

  // Handle scroll position restoration when menu closes
  let scrollPosition = 0;
  
  function handleMenuOpen() {
    scrollPosition = window.pageYOffset;
    document.body.style.top = `-${scrollPosition}px`;
    document.body.classList.add('menu-open');
  }
  
  function handleMenuClose() {
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
  }

  menuToggle.addEventListener('click', () => {
    if (!menuContent.classList.contains('active')) {
      handleMenuOpen();
    } else {
      handleMenuClose();
    }
  });

  closeMenu.addEventListener('click', handleMenuClose);
  menuOverlay.addEventListener('click', handleMenuClose);
});

function displayQuizQuestion() {
  clearInterval(timerInterval);
  const existingTimer = document.getElementById('question-timer');
  if (existingTimer) existingTimer.remove();

  const { question, answer, type } = generateQuizQuestion();
  currentQuestion = { question, answer, type };
  
  document.getElementById('question-type').textContent = question.type;
  
  let questionText = '';
  if (type === 'crossToSphero') {
    questionText = `${formatristolRx(question.rx.cross1)}\n${formatristolRx(question.rx.cross2)}`;
  } else if (type === 'toric') {
    // Fix: Remove duplicate base curve display
    const rxWithBC = {
      sphere: question.rx.sphere,
      cylinder: question.rx.cylinder,
      axis: question.rx.axis,
      baseCurve: question.rx.baseCurve
    };
    questionText = formatristolRx(rxWithBC);
  } else if (type === 'opticCross') {
    questionText = `
      <div class="prescription">
        <span style="color: #4CAF50">Vertical: ${formatNum(question.opticCross.vertical.power)}@${question.opticCross.vertical.axis}°</span><br>
        <span style="color: #F44336">Horizontal: ${formatNum(question.opticCross.horizontal.power)}@${question.opticCross.horizontal.axis}°</span>
      </div>
      ${generateOpticCross(question.opticCross)}
    `;
  } else {
    questionText = formatristolRx(question.rx);
  }
  
  document.getElementById('quiz-question').innerHTML = questionText;
  document.getElementById('user-answer').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('next-question').style.display = 'none';
  document.getElementById('answer-reveal').classList.remove('visible');
  document.getElementById('user-answer').focus();
}