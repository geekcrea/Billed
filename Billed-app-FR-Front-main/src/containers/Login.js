import { ROUTES_PATH } from '../constants/routes.js';
export let PREVIOUS_LOCATION = '';

// we use a class so as to test its methods in e2e tests
export default class Login {
	constructor({
		document,
		localStorage,
		onNavigate,
		PREVIOUS_LOCATION,
		store,
	}) {
		this.document = document;
		this.localStorage = localStorage;
		this.onNavigate = onNavigate;
		this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
		this.store = store;
		const formEmployee = this.document.querySelector(
			`form[data-testid="form-employee"]`
		);
		formEmployee.addEventListener('submit', this.handleSubmitEmployee);
		const formAdmin = this.document.querySelector(
			`form[data-testid="form-admin"]`
		);
		formAdmin.addEventListener('submit', this.handleSubmitAdmin);
	}
	handleSubmitEmployee = e => {
		e.preventDefault();
		const user = {
			type: 'Employee',
			email: e.target.querySelector(`input[data-testid="employee-email-input"]`)
				.value,
			password: e.target.querySelector(
				`input[data-testid="employee-password-input"]`
			).value,
			status: 'connected',
		};
		this.localStorage.setItem('user', JSON.stringify(user));
		this.login(user)
			.catch(err => this.createUser(user))
			.then(() => {
				this.onNavigate(ROUTES_PATH['Bills']);
				this.PREVIOUS_LOCATION = ROUTES_PATH['Bills'];
				PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
				this.document.body.style.backgroundColor = '#fff';
			});
	};
	handleSubmitAdmin = e => {
		e.preventDefault();
		// Vérifier l'événement
		console.log('Event:', e);

		const emailInput = e.target.querySelector(
			`input[data-testid="admin-email-input"]`
		);
		const passwordInput = e.target.querySelector(
			`input[data-testid="admin-password-input"]`
		);
		// Vérifier si l'élément email est trouvé
		console.log('Email input:', emailInput);
		// Vérifier si l'élément password est trouvé
		console.log('Password input:', passwordInput);

		const user = {
			type: 'Admin',
			email: emailInput ? emailInput.value : 'Email input not found',
			password: passwordInput
				? passwordInput.value
				: 'Password input not found',
			status: 'connected',
		};
		// Vérifier l'objet user créé
		console.log('User object:', user);

		this.localStorage.setItem('user', JSON.stringify(user));
		// Vérifier le stockage
		console.log(
			'User stored in localStorage:',
			JSON.parse(this.localStorage.getItem('user'))
		);

		this.login(user)
			.catch(err => {
				// Capturer les erreurs de login
				console.log('Login error:', err);
				return this.createUser(user);
			})
			.then(() => {
				// Vérifier la navigation
				console.log('Navigation to Dashboard');
				this.onNavigate(ROUTES_PATH['Dashboard']);
				this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard'];
				PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
				// Vérifier PREVIOUS_LOCATION
				console.log('PREVIOUS_LOCATION:', PREVIOUS_LOCATION);
				document.body.style.backgroundColor = '#fff';
			});

		console.log('handleSubmitAdmin completed'); // Vérifier si la fonction se termine
	};
	// handleSubmitAdmin = e => {
	// 	e.preventDefault();
	// 	const user = {
	// 		type: 'Admin',
	// 		email: e.target.querySelector(`input[data-testid="admin-email-input"]`)
	// 			.value,

	// 		password: e.target.querySelector(
	// 			`input[data-testid="admin-password-input"]`
	// 		).value,
	// 		status: 'connected',
	// 	};

	// 	this.localStorage.setItem('user', JSON.stringify(user));
	// 	this.login(user)
	// 		.catch(err => this.createUser(user))
	// 		.then(() => {
	// 			this.onNavigate(ROUTES_PATH['Dashboard']);
	// 			this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard'];
	// 			PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
	// 			document.body.style.backgroundColor = '#fff';
	// 		});
	// };

	// not need to cover this function by tests
	/* istanbul ignore next */
	login = user => {
		if (this.store) {
			return this.store
				.login(
					JSON.stringify({
						email: user.email,
						password: user.password,
					})
				)
				.then(({ jwt }) => {
					localStorage.setItem('jwt', jwt);
				});
		} else {
			return null;
		}
	};

	// not need to cover this function by tests
	/* istanbul ignore next */
	createUser = user => {
		if (this.store) {
			return this.store
				.users()
				.create({
					data: JSON.stringify({
						type: user.type,
						name: user.email.split('@')[0],
						email: user.email,
						password: user.password,
					}),
				})
				.then(() => {
					console.log(`User with ${user.email} is created`);
					return this.login(user);
				});
		} else {
			return null;
		}
	};
}
