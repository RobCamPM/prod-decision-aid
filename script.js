document.addEventListener("DOMContentLoaded", function() {
    // Initialize response object to store user inputs
    const responses = {
        medication: '', sexType: '', dosingUnderstanding: '', frequency: '',
        planning: '', cost: '', dailyComfort: '', protection: ''
    };

    // Current step in the form
    let currentStep = 'introStep';
    // Total number of steps
    const totalSteps = 9; // Adjusted for the new steps
    // Order of steps
    const stepOrder = ['introStep', 'step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8', 'summaryStep'];

    // CTA link and resource links
    const ctaLink = "https://app.gofreddie.com/form/province-q";
    const prepResources = [
        { text: "PrEP On Demand Explained", link: "https://www.gofreddie.com/prep-on-demand"},
        { text: "GoFreddie - PrEP Explained", link: "https://www.gofreddie.com/prep-explained" },
        { text: "Canada Public Health - HIV Factsheet", link: "https://www.canada.ca/en/public-health/services/publications/diseases-conditions/hiv-factsheet-biomedical-prevention-prep-pep.html" }
    ];

    // Helper function to get an element by ID
    const getElement = (id) => document.getElementById(id);

    // Update the progress bar based on the current step
    const updateProgressBar = () => {
        const progressBar = document.querySelector('.progress-bar div');
        const progressSteps = document.querySelectorAll('.progress-steps span');
        if (progressBar) {
            const currentIndex = stepOrder.indexOf(currentStep);
            const progress = ((currentIndex - 1) / (totalSteps - 1)) * 100;
            progressBar.style.width = `${progress}%`;
            progressSteps.forEach((step, index) => {
                if (index < currentIndex - 1) {
                    step.classList.add('completed');
                } else {
                    step.classList.remove('completed');
                }
            });
        }
    };

    // Helper function to add or remove a class from a list of elements
    const toggleClass = (elements, className, action) => {
        elements.forEach(el => el.classList[action](className));
    };

    // Set the response for a single-select question and move to the next step
    const setResponse = (question, value, step) => {
        responses[question] = value;
        toggleClass(document.querySelectorAll(`#${step} .option`), 'selected', 'remove');
        document.querySelector(`#${step} .option[onclick*="${value}"]`).classList.add('selected');
        nextStep(step);
    };

    // Navigate to the next step
    const nextStep = (step) => {
        try {
            getElement(step).classList.remove('active');
            getElement(step).style.display = 'none';
            if (step === 'step8') {
                currentStep = 'summaryStep';
                updateSummary();
            } else {
                currentStep = stepOrder[stepOrder.indexOf(step) + 1];
            }
            if (currentStep) {
                getElement(currentStep).style.display = 'block';
                getElement(currentStep).classList.add('active');
                updateURL(currentStep);
                if (step !== 'introStep') updateProgressBar();
            } else {
                evaluateResponses();
            }
        } catch (error) {
            console.error('Error navigating to the next step:', error);
            alert('An error occurred while navigating. Please try again.');
        }
    };

    // Navigate to the previous step
    const prevStep = (step) => {
        getElement(step).classList.remove('active');
        getElement(step).style.display = 'none';
        currentStep = stepOrder[stepOrder.indexOf(step) - 1];
        if (currentStep) {
            getElement(currentStep).style.display = 'block';
            getElement(currentStep).classList.add('active');
            updateURL(currentStep);
            if (currentStep !== 'introStep') updateProgressBar();
        }
    };

    // Update the summary content based on user responses
    const updateSummary = () => {
        const summaryContent = `
            <div class="summary-card">
                <h4><i class="fas fa-capsules icon"></i> Your Responses</h4>
                <p><strong>PrEP Medication:</strong> ${responses.medication}</p>
                <p><strong>Type of Sex:</strong> ${responses.sexType}</p>
                <p><strong>Understanding of Dosing:</strong> ${responses.dosingUnderstanding}</p>
                <p><strong>Frequency of Sex:</strong> ${responses.frequency}</p>
                <p><strong>Ability to Plan:</strong> ${responses.planning}</p>
                <p><strong>Concern About Cost:</strong> ${responses.cost}</p>
                <p><strong>Comfort with Daily Medication:</strong> ${responses.dailyComfort}</p>
                <p><strong>Importance of Consistent Protection:</strong> ${responses.protection}</p>
            </div>
        `;
        getElement('summaryContent').innerHTML = summaryContent;
    };

    // Update the URL to reflect the current step
    const updateURL = (step) => {
        history.pushState(null, '', `#${step}`);
    };

    // Navigate to the step based on the URL hash
    const navigateToStepFromURL = () => {
        const hash = window.location.hash.substring(1);
        if (hash && stepOrder.includes(hash)) {
            currentStep = hash;
            stepOrder.forEach(step => {
                getElement(step).style.display = step === currentStep ? 'block' : 'none';
                if (step === currentStep) {
                    getElement(step).classList.add('active');
                } else {
                    getElement(step).classList.remove('active');
                }
            });
            updateProgressBar();
        }
    };

    // Handle browser back/forward navigation
    window.onpopstate = navigateToStepFromURL;

    // Submit the form and evaluate responses
    window.submitForm = () => {
        evaluateResponses();
    };

    // Evaluate user responses and generate the result content
    const evaluateResponses = () => {
        let recommendation = '';
        let detailedReason = '';

        // Custom logic based on responses
        if (responses.medication === 'Descovy' || responses.sexType !== 'Anal') {
            recommendation = 'Daily PrEP is recommended';
            detailedReason = 'PrEP on-demand has only been shown to work with the Truvada version of PrEP and is only approved for preventing HIV transmission through anal sex.';
        } else if (responses.dosingUnderstanding === 'NoIdea') {
            recommendation = 'Daily PrEP might be more suitable';
            detailedReason = 'PrEP on-demand requires a good understanding of the 2-1-1 regimen, which you indicated you are not familiar with.';
        } else if (responses.frequency === 'frequent' || responses.planning === 'no' || responses.dailyComfort === 'very') {
            recommendation = 'Daily PrEP might be the best option';
            detailedReason = 'Daily PrEP provides continuous protection and is suitable for people who have frequent sex or cannot plan their sexual activity in advance.';
        } else if (responses.frequency === 'infrequent' && responses.planning === 'yes' && responses.dailyComfort !== 'very') {
            recommendation = 'PrEP on Demand might be the best option';
            detailedReason = 'PrEP on demand involves taking fewer pills and is suitable for people who have infrequent sex and can plan their sexual activity in advance.';
        } else {
            recommendation = 'Either Daily PrEP or PrEP on Demand could be suitable';
            detailedReason = 'Please discuss with your healthcare provider to determine the best approach for you.';
        }

        const resultContent = `
            <div class="card">
                <h3>Recommendation</h3>
                <p>${recommendation}</p>
                <h4>Reason</h4>
                <p>${detailedReason}</p>
                <h4>Next Steps</h4>
                <p>Consider scheduling an appointment with your healthcare provider to discuss your options and get a prescription for PrEP.</p>
                <div class="cta">
                    <a href="${ctaLink}" target="_blank" class="button">Get Started with PrEP</a>
                    <button type="button" class="ghost-button" onclick="showReminderForm()">Remind me to sign up later</button>
                    <form id="reminderForm" style="display:none;" onsubmit="submitReminder(event)">
                        <label for="email">Enter your email:</label>
                        <input type="email" id="email" name="email" required>
                        <button type="submit" class="button">Submit</button>
                    </form>
                </div>
                <h4>Additional Resources</h4>
                <ul>
                    ${prepResources.map(resource => `<li><a href="${resource.link}" target="_blank">${resource.text}</a></li>`).join('')}
                </ul>
                <button type="button" class="restart-button" onclick="restart()">Restart</button>
            </div>
        `;

        getElement('result').innerHTML = resultContent;
        getElement('decisionAidForm').style.display = 'none';
        getElement('result').style.display = 'block';
    };

    // Handle reminder form submission
    window.submitReminder = (event) => {
        event.preventDefault();
        const email = getElement('email').value;
        alert(validateEmail(email) ? `This feature is just for demo purposes and is not currently functioning` : 'Please enter a valid email address.');
    };

    // Validate email format
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    window.validateEmail = validateEmail;
    // Show the reminder form
    window.showReminderForm = () => getElement('reminderForm').style.display = 'block';

    // Assign functions to window for global access
    window.selectOption = setResponse;
    window.nextStep = nextStep;
    window.prevStep = prevStep;
    window.submitForm = submitForm;

    // Reset the form to the initial state
    window.restart = () => {
        // Reset responses
        Object.keys(responses).forEach(key => {
            responses[key] = '';
        });

        // Reset to the initial step
        const initialStep = 'introStep';
        stepOrder.forEach(step => {
            getElement(step).style.display = step === initialStep ? 'block' : 'none';
            if (step === initialStep) {
                getElement(step).classList.add('active');
            } else {
                getElement(step).classList.remove('active');
            }
        });

        // Reset progress bar
        updateProgressBar();

        // Reset URL
        updateURL(initialStep);

        // Hide result section if visible
        getElement('result').style.display = 'none';

        // Show form again
        getElement('decisionAidForm').style.display = 'block';
    };

    // Initialize progress bar and navigation from URL
    updateProgressBar();
    navigateToStepFromURL();
});
