import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    this.errorDate = false;
    this.errorFile = false;
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    const date = this.document.querySelector(`input[data-testid="datepicker"]`);
    date.addEventListener("change", this.handleChangeDate);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    this.EXTENSION_FILES = ["png", "jpeg", "jpg"];
    new Logout({ document, localStorage, onNavigate });
  }

  storeNewBill = (error, file) => {
    this.errorFile = false;
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    if (error) {
      error.remove();
    }

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ filePath, key, fileName }) => {
        this.billId = key;
        this.fileUrl = filePath;
        this.fileName = fileName;
      })
      .catch((error) => console.error(error));
  };

  displayErrorFile = (error) => {
    this.errorFile = true;
    const inputFile = this.document.querySelector("#file");
    if (!error) {
      error = this.document.createElement("p");
      error.textContent = "Veuillez ajouter une image au format PNG, JPG ou JPEG";
      error.classList.add("error-file");
      error.setAttribute("data-testid", "errorFile");
      inputFile.after(error);
    }
  };

  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    const fileName = file.name;
    const extension = fileName.split(".").at(-1);
    const error = this.document.querySelector(".error-file");

    if (this.EXTENSION_FILES.includes(extension)) {
      this.storeNewBill(error, file);
    } else {
      this.displayErrorFile(error);
    }
  };

  handleChangeDate = (e) => {
    const inputDate = this.document.querySelector(`input[data-testid="datepicker"]`);
    const dateSelected = inputDate.value.split("-");
    const daySelected = +dateSelected[2];
    const monthSelected = +dateSelected[1];
    const yearSelected = +dateSelected[0];
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    let errorDate = this.document.querySelector(".error-date");

    if (!errorDate) {
      errorDate = this.document.createElement("p");
      errorDate.textContent = "Veuillez sélectionner une date précédent la date d'ajourd'hui";
      errorDate.setAttribute("class", "error-date");
      errorDate.setAttribute("data-testid", "errorDate");
    }

    if (yearSelected > year) {
      this.errorDate = true;
    } else if (yearSelected === year && monthSelected > month) {
      this.errorDate = true;
    } else if (
      yearSelected === year &&
      monthSelected === month &&
      daySelected > day
    ) {
      this.errorDate = true;
    } else {
      this.errorDate = false;
    }

    this.errorDate ? inputDate.after(errorDate) : errorDate.remove();
  };

  handleSubmit = (e) => {
    e.preventDefault();

    if (!this.errorDate && !this.errorFile) {
      const email = JSON.parse(localStorage.getItem("user")).email;
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct:
          parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
          20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: "pending",
      };
      this.updateBill(bill);
      this.onNavigate(ROUTES_PATH["Bills"]);
    }
  };

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
