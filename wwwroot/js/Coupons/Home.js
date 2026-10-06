const CouponsById = new Map();
let CouponStartDate = "";
let CouponEndDate = "";

document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("CouponsModule", "CouponsModuleHome");
    InitializeCouponFilterDates();
    LoadCoupons();
    LoadCouponSelects();
    InitTooltips();
    InitCouponInputs();
    SetDefaultExpirationDate("CreateModalExpirationDate");

    const BtnDeleteCoupon = document.getElementById('BtnDeleteCoupon');
    BtnDeleteCoupon.addEventListener('click', async () => {
        await DeleteCoupon();
    });

    const BtnFilterCouponsModal = document.getElementById('BtnFilterCouponsModal');
    BtnFilterCouponsModal.addEventListener('click', () => {
        FilterCouponsModalOpen();
    });

    const BtnApplyCouponFilter = document.getElementById('BtnApplyCouponFilter');
    BtnApplyCouponFilter.addEventListener('click', async () => {
        await ApplyCouponFilter();
    });

    const BtnCreateCouponModal = document.getElementById('BtnCreateCouponModal');
    BtnCreateCouponModal.addEventListener('click', async () => {
        await CreateCouponModalOpen();
    });

    const BtnCreateCoupon = document.getElementById('BtnCreateCoupon');
    BtnCreateCoupon.addEventListener('click', async () => {
        await AddCoupon();
    });

    const BtnUpdateCoupon = document.getElementById('BtnUpdateCoupon');
    BtnUpdateCoupon.addEventListener('click', async () => {
        await UpdateCoupon();
    });
});

function InitializeCouponFilterDates() {
    CouponStartDate = GetCurrentDateInputValue();
    CouponEndDate = CouponStartDate;
    document.getElementById("FilterModalStartDate").value = CouponStartDate;
    document.getElementById("FilterModalEndDate").value = CouponEndDate;
}

function FilterCouponsModalOpen() {
    document.getElementById("FilterModalStartDate").value = CouponStartDate;
    document.getElementById("FilterModalEndDate").value = CouponEndDate;
    const FilterCouponsModal = new bootstrap.Modal(document.getElementById("FilterCouponsModal"));
    FilterCouponsModal.show();
}

async function ApplyCouponFilter() {
    const StartDate = document.getElementById("FilterModalStartDate").value;
    const EndDate = document.getElementById("FilterModalEndDate").value;

    if (!StartDate || !EndDate) {
        showToast("warning", "Seleccione la fecha inicial y la fecha final");
        return;
    }

    if (EndDate < StartDate) {
        showToast("warning", "La fecha final no puede ser menor que la fecha inicial");
        return;
    }

    try {
        SetButtonLoading('BtnApplyCouponFilter', 'SpinnerApplyCouponFilter', 'IconApplyCouponFilter', 'Cargando...');
        CouponStartDate = StartDate;
        CouponEndDate = EndDate;
        await LoadCoupons();

        const modalElement = document.getElementById('FilterCouponsModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
    } catch (error) {
        showToast("danger", error);
    } finally {
        ClearButtonLoading('BtnApplyCouponFilter', 'SpinnerApplyCouponFilter', 'IconApplyCouponFilter');
    }
}

function GetCurrentDateInputValue() {
    const DateValue = new Date();
    const Year = DateValue.getFullYear();
    const Month = String(DateValue.getMonth() + 1).padStart(2, '0');
    const Day = String(DateValue.getDate()).padStart(2, '0');
    return `${Year}-${Month}-${Day}`;
}

async function LoadCoupons() {
    const tbody = document.querySelector("#CouponsTable tbody");
    const Query = new URLSearchParams({
        StartDate: CouponStartDate,
        EndDate: CouponEndDate
    });

    try {
        const response = await fetch(`/Coupons/GetCoupons?${Query.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null) || [];
            CouponsById.clear();
            tbody.innerHTML = "";

            result.forEach(c => {
                CouponsById.set(c.id, c);
                const tr = document.createElement("tr");
                const Type = GetCouponTypeLabel(c.type);
                const PaymentType = GetPaymentTypeLabel(c.paymentType);
                const Comments = EscapeHtml(c.comments) || "Sin comentarios";

                tr.setAttribute("data-id", c.id);
                tr.innerHTML = `
                    <td>${FormatCouponDate(c.createdDate)}</td>
                    <td>${EscapeHtml(c.customer)}</td>
                    <td>${EscapeHtml(c.recipient) || "Sin destinatario"}</td>
                    <td>${EscapeHtml(c.phone)}</td>
                    <td>${c.quantity}</td>
                    <td>${Type}</td>
                    <td>${FormatCouponDate(c.appointmentDate)}</td>
                    <td>${FormatCouponDate(c.expirationDate)}</td>
                    <td>${EscapeHtml(c.therapist)}</td>
                    <td>${EscapeHtml(c.reference)}</td>
                    <td>${PaymentType}</td>
                    <td>
                        <button type="button" class="btn btn-outline-info btn-sm" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-placement="top" data-bs-title="Comentarios" data-bs-content="${Comments}" data-bs-html="false" aria-label="Ver comentarios">
                            <i class="bi bi-chat-left-text"></i>
                        </button>
                    </td>
                    <td>
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button onclick="DeleteCouponModalOpen(${c.id})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eliminar cupón" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateCouponModalOpen(${c.id})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar cupón" class="btn btn-outline-warning">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            document.getElementById("CouponsCount").innerText = result.length;
            InitTooltips();
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}

async function LoadCouponSelects() {
    try {
        const CustomersResponse = await fetch(`/Customers/GetCustomers`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const TherapistsResponse = await fetch(`/Therapists/GetTherapistsSelect`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (CustomersResponse.status >= 200 && CustomersResponse.status <= 299) {
            const Customers = await CustomersResponse.json().catch(() => null) || [];
            SetSelectOptions("CreateModalCustomerId", Customers, "Seleccione un cliente", c => c.id, c => c.name);
            SetSelectOptions("UpdateModalCustomerId", Customers, "Seleccione un cliente", c => c.id, c => c.name);
        }

        if (TherapistsResponse.status >= 200 && TherapistsResponse.status <= 299) {
            const Therapists = await TherapistsResponse.json().catch(() => null) || [];
            SetSelectOptions("CreateModalTherapistId", Therapists, "Seleccione un terapista", t => t.value, t => t.description);
            SetSelectOptions("UpdateModalTherapistId", Therapists, "Seleccione un terapista", t => t.value, t => t.description);
        }

        if (CustomersResponse.status >= 400 && CustomersResponse.status <= 499 || TherapistsResponse.status >= 400 && TherapistsResponse.status <= 499) {
            showToast("warning", "No fue posible cargar los clientes o terapistas");
        }

        if (CustomersResponse.status >= 500 && CustomersResponse.status <= 599 || TherapistsResponse.status >= 500 && TherapistsResponse.status <= 599) {
            showToast("danger", "No fue posible cargar los clientes o terapistas");
        }
    } catch (error) {
        showToast("danger", error);
    }
}

function SetSelectOptions(SelectId, Items, Placeholder, ValueCallback, TextCallback) {
    const Select = document.getElementById(SelectId);
    Select.innerHTML = `<option value="">${Placeholder}</option>`;

    Items.forEach(Item => {
        const Option = document.createElement("option");
        Option.value = ValueCallback(Item);
        Option.textContent = TextCallback(Item) || "Sin nombre";
        Select.appendChild(Option);
    });
}

function InitTooltips() {
    const Tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    Tooltips.forEach(t => {
        if (!bootstrap.Tooltip.getInstance(t)) {
            new bootstrap.Tooltip(t);
        }
    });

    const Popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    Popovers.forEach(p => {
        if (!bootstrap.Popover.getInstance(p)) {
            new bootstrap.Popover(p);
        }
    });
}

function InitCouponInputs() {
    const NumericInputs = document.querySelectorAll('#CreateModalPhone, #UpdateModalPhone, #CreateModalQuantity, #UpdateModalQuantity');
    NumericInputs.forEach(NumericInput => {
        NumericInput.addEventListener('input', () => {
            NumericInput.value = NumericInput.value.replace(/[^0-9]/g, '');
        });
    });
}

function SetButtonLoading(ButtonId, SpinnerId, IconId, LoadingTitle) {
    const Button = document.getElementById(ButtonId);
    const Spinner = document.getElementById(SpinnerId);
    const Icon = document.getElementById(IconId);
    if (!Button || !Spinner || !Icon) return;

    Spinner.style.display = "inline-flex";
    Icon.style.display = "none";
    Button.setAttribute('data-original-title', Button.getAttribute('data-bs-title') || '');
    Button.disabled = true;

    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) {
        Tooltip.setContent({ '.tooltip-inner': LoadingTitle });
    }
    Button.setAttribute('data-bs-title', LoadingTitle);
}

function ClearButtonLoading(ButtonId, SpinnerId, IconId) {
    const Button = document.getElementById(ButtonId);
    const Spinner = document.getElementById(SpinnerId);
    const Icon = document.getElementById(IconId);
    if (!Button || !Spinner || !Icon) return;

    Spinner.style.display = "none";
    Icon.style.display = "inline-flex";
    const OriginalTitle = Button.getAttribute('data-original-title') || '';
    Button.disabled = false;

    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) {
        Tooltip.setContent({ '.tooltip-inner': OriginalTitle });
    }
    Button.setAttribute('data-bs-title', OriginalTitle);
}

function CreateCouponModalOpen() {
    document.getElementById("CreateModalExpirationDate").value = GetDefaultExpirationDate();
    const CreateCouponModal = new bootstrap.Modal(document.getElementById("CreateCouponModal"));
    CreateCouponModal.show();
}

async function AddCoupon() {
    try {
        const Data = GetCouponFormData("Create");
        if (!ValidateCouponData(Data, "Create")) return;

        SetButtonLoading('BtnCreateCoupon', 'SpinnerCreateCoupon', 'IconCreateCoupon', 'Guardando...');
        const response = await fetch("/Coupons/AddCoupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            ResetCouponForm("Create");
            showToast("success", result);
            const modalElement = document.getElementById('CreateCouponModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadCoupons();
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    } finally {
        ClearButtonLoading('BtnCreateCoupon', 'SpinnerCreateCoupon', 'IconCreateCoupon');
    }
}

function UpdateCouponModalOpen(Id) {
    const Coupon = CouponsById.get(Id);
    if (!Coupon) return;

    sessionStorage.setItem('CouponIdSelected', Id);
    document.getElementById("UpdateModalCustomerId").value = Coupon.customerId;
    document.getElementById("UpdateModalRecipient").value = Coupon.recipient || "";
    document.getElementById("UpdateModalPhone").value = Coupon.phone || "";
    document.getElementById("UpdateModalQuantity").value = Coupon.quantity;
    document.getElementById("UpdateModalAppointmentDate").value = ToInputDate(Coupon.appointmentDate);
    document.getElementById("UpdateModalExpirationDate").value = ToInputDate(Coupon.expirationDate);
    document.getElementById("UpdateModalTherapistId").value = Coupon.therapistId;
    document.getElementById("UpdateModalReference").value = Coupon.reference || "";
    document.getElementById("UpdateModalComments").value = Coupon.comments || "";
    document.getElementById("UpdateModalPaymentType").value = Coupon.paymentType;
    SetCouponType("Update", Coupon.type);

    const UpdateCouponModal = new bootstrap.Modal(document.getElementById("UpdateCouponModal"));
    UpdateCouponModal.show();
}

async function UpdateCoupon() {
    try {
        const Data = GetCouponFormData("Update");
        Data.Id = Number(sessionStorage.getItem('CouponIdSelected'));
        if (!ValidateCouponData(Data, "Update")) return;

        SetButtonLoading('BtnUpdateCoupon', 'SpinnerUpdateCoupon', 'IconUpdateCoupon', 'Actualizando...');
        const response = await fetch("/Coupons/UpdateCoupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const modalElement = document.getElementById('UpdateCouponModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadCoupons();
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    } finally {
        ClearButtonLoading('BtnUpdateCoupon', 'SpinnerUpdateCoupon', 'IconUpdateCoupon');
    }
}

function DeleteCouponModalOpen(Id) {
    const Coupon = CouponsById.get(Id);
    if (!Coupon) return;

    document.getElementById("LabelModalDeleteCoupon").innerText = Coupon.reference || Id;
    sessionStorage.setItem('CouponIdSelected', Id);
    const DeleteCouponModal = new bootstrap.Modal(document.getElementById("DeleteCouponModal"));
    DeleteCouponModal.show();
}

async function DeleteCoupon() {
    try {
        SetButtonLoading('BtnDeleteCoupon', 'SpinnerDeleteCoupon', 'IconDeleteCoupon', 'Eliminando...');
        const Id = sessionStorage.getItem('CouponIdSelected');
        const response = await fetch(`/Coupons/DeleteCoupon?CouponId=${Id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const modalElement = document.getElementById('DeleteCouponModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadCoupons();
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    } finally {
        ClearButtonLoading('BtnDeleteCoupon', 'SpinnerDeleteCoupon', 'IconDeleteCoupon');
    }
}

function GetCouponFormData(Prefix) {
    const Type = document.querySelector(`input[name="${Prefix}ModalType"]:checked`);
    return {
        CustomerId: Number(document.getElementById(`${Prefix}ModalCustomerId`).value),
        Recipient: document.getElementById(`${Prefix}ModalRecipient`).value,
        Phone: document.getElementById(`${Prefix}ModalPhone`).value,
        Quantity: Number(document.getElementById(`${Prefix}ModalQuantity`).value),
        Type: Type ? Number(Type.value) : 0,
        AppointmentDate: document.getElementById(`${Prefix}ModalAppointmentDate`).value || null,
        ExpirationDate: document.getElementById(`${Prefix}ModalExpirationDate`).value,
        TherapistId: Number(document.getElementById(`${Prefix}ModalTherapistId`).value),
        Reference: document.getElementById(`${Prefix}ModalReference`).value,
        PaymentType: Number(document.getElementById(`${Prefix}ModalPaymentType`).value),
        Comments: document.getElementById(`${Prefix}ModalComments`).value
    };
}

function ValidateCouponData(Data, Prefix) {
    if (!Data.CustomerId) {
        showToast("warning", "El cliente es obligatorio");
        document.getElementById(`${Prefix}ModalCustomerId`).focus();
        return false;
    }

    if (!Data.Phone || !/^[0-9]+$/.test(Data.Phone)) {
        showToast("warning", "El teléfono solo debe contener números");
        document.getElementById(`${Prefix}ModalPhone`).focus();
        return false;
    }

    if (!Number.isInteger(Data.Quantity) || Data.Quantity <= 0) {
        showToast("warning", "La cantidad de cupones debe ser mayor a cero");
        document.getElementById(`${Prefix}ModalQuantity`).focus();
        return false;
    }

    if (![1, 2].includes(Data.Type)) {
        showToast("warning", "Seleccione el tipo de cupón");
        return false;
    }

    if (!Data.ExpirationDate) {
        showToast("warning", "La fecha de expiración es obligatoria");
        document.getElementById(`${Prefix}ModalExpirationDate`).focus();
        return false;
    }

    if (!Data.TherapistId) {
        showToast("warning", "El terapista es obligatorio");
        document.getElementById(`${Prefix}ModalTherapistId`).focus();
        return false;
    }

    if (!Data.Reference.trim()) {
        showToast("warning", "La referencia es obligatoria");
        document.getElementById(`${Prefix}ModalReference`).focus();
        return false;
    }

    if (![1, 2, 3, 4].includes(Data.PaymentType)) {
        showToast("warning", "El tipo de pago es obligatorio");
        document.getElementById(`${Prefix}ModalPaymentType`).focus();
        return false;
    }

    return true;
}

function ResetCouponForm(Prefix) {
    document.getElementById(`${Prefix}ModalCustomerId`).value = "";
    document.getElementById(`${Prefix}ModalRecipient`).value = "";
    document.getElementById(`${Prefix}ModalPhone`).value = "";
    document.getElementById(`${Prefix}ModalQuantity`).value = "";
    document.getElementById(`${Prefix}ModalAppointmentDate`).value = "";
    document.getElementById(`${Prefix}ModalExpirationDate`).value = GetDefaultExpirationDate();
    document.getElementById(`${Prefix}ModalTherapistId`).value = "";
    document.getElementById(`${Prefix}ModalReference`).value = "";
    document.getElementById(`${Prefix}ModalComments`).value = "";
    document.getElementById(`${Prefix}ModalPaymentType`).value = "";
    document.querySelectorAll(`input[name="${Prefix}ModalType"]`).forEach(Radio => Radio.checked = false);
}

function SetCouponType(Prefix, Type) {
    document.querySelectorAll(`input[name="${Prefix}ModalType"]`).forEach(Radio => {
        Radio.checked = Number(Radio.value) === Number(Type);
    });
}

function SetDefaultExpirationDate(InputId) {
    document.getElementById(InputId).value = GetDefaultExpirationDate();
}

function GetDefaultExpirationDate() {
    const DateValue = new Date();
    DateValue.setHours(0, 0, 0, 0);
    DateValue.setMonth(DateValue.getMonth() + 3);
    return DateValue.toISOString().slice(0, 10);
}

function ToInputDate(DateValue) {
    if (!DateValue || DateValue.startsWith("0001")) return "";
    return DateValue.slice(0, 10);
}

function FormatCouponDate(DateValue) {
    if (!DateValue || DateValue.startsWith("0001")) return "Sin fecha";
    return new Date(`${DateValue.slice(0, 10)}T00:00:00`).toLocaleDateString('es-MX');
}

function GetCouponTypeLabel(Type) {
    return Type === 1 ? "Físico" : Type === 2 ? "Digital" : "Sin tipo";
}

function GetPaymentTypeLabel(PaymentType) {
    const Labels = {
        1: "Efectivo",
        2: "Transferencia",
        3: "Tarjeta de crédito",
        4: "Tarjeta de débito"
    };
    return Labels[PaymentType] || "Sin tipo";
}

function EscapeHtml(Value) {
    return String(Value ?? "").replace(/[&<>'"]/g, Character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[Character]);
}
