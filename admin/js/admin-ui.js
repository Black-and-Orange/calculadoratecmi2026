// admin-ui.js — Helpers de interfaz compartidos del panel (NO es módulo).
// Expone en window: tecToast, tecConfirm y tecFormModal, para que tanto los
// módulos ES (control*.js) como los onclick inline puedan usarlos.
// Requiere Bootstrap 4 + jQuery (ya cargados en panel.html).

(function () {
    'use strict';

    // ── Contenedor de toasts ────────────────────────────────
    function getToastWrap() {
        let wrap = document.querySelector('.tec-toast-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'tec-toast-wrap';
            document.body.appendChild(wrap);
        }
        return wrap;
    }

    /**
     * Muestra un aviso flotante.
     * @param {string} mensaje
     * @param {'exito'|'error'} tipo
     */
    window.tecToast = function (mensaje, tipo = 'exito') {
        const wrap = getToastWrap();
        const toast = document.createElement('div');
        toast.className = 'tec-toast' + (tipo === 'error' ? ' error' : '');
        const icono = tipo === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
        toast.innerHTML = `<i class="fas ${icono} tec-toast-ico"></i><span></span>`;
        toast.querySelector('span').textContent = mensaje;
        wrap.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity .4s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 450);
        }, 3500);
    };

    // ── Modal de confirmación ───────────────────────────────
    /**
     * Pide confirmación con un modal. Reemplaza a confirm().
     * @param {string} mensaje
     * @param {{titulo?: string, btnTexto?: string}} opts
     * @returns {Promise<boolean>}
     */
    window.tecConfirm = function (mensaje, opts = {}) {
        return new Promise((resolve) => {
            const id = 'tecConfirmModal';
            document.getElementById(id)?.remove();
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = id;
            modal.setAttribute('tabindex', '-1');
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-sm" role="document">
                    <div class="modal-content tec-modal">
                        <div class="modal-body text-center pt-4">
                            <span class="tec-modal-icono peligro"><i class="fas fa-trash-alt"></i></span>
                            <h5 class="tec-modal-titulo">${opts.titulo || '¿Eliminar registro?'}</h5>
                            <p class="tec-modal-texto mb-0"></p>
                        </div>
                        <div class="modal-footer border-0 justify-content-center pb-4">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" data-accion="confirmar">${opts.btnTexto || 'Sí, eliminar'}</button>
                        </div>
                    </div>
                </div>`;
            modal.querySelector('.tec-modal-texto').textContent = mensaje;
            document.body.appendChild(modal);

            let confirmado = false;
            modal.querySelector('[data-accion="confirmar"]').addEventListener('click', () => {
                confirmado = true;
                $(modal).modal('hide');
            });
            $(modal).on('hidden.bs.modal', () => {
                modal.remove();
                resolve(confirmado);
            });
            $(modal).modal('show');
        });
    };

    // ── Modal de formulario (reemplaza cadenas de prompt) ───
    /**
     * Muestra un formulario en modal y resuelve con los valores o null si se cancela.
     * @param {string} titulo
     * @param {Array<{name:string,label:string,value?:any,type?:'text'|'number'|'date'|'checkbox',step?:string,required?:boolean}>} campos
     * @param {{btnTexto?: string}} opts
     * @returns {Promise<Object|null>} valores por name (checkbox → boolean, resto → string)
     */
    window.tecFormModal = function (titulo, campos, opts = {}) {
        return new Promise((resolve) => {
            const id = 'tecFormModal';
            document.getElementById(id)?.remove();

            const inputsHtml = campos.map((c, i) => {
                const inputId = `tecFm_${c.name}`;
                if (c.type === 'checkbox') {
                    return `
                        <div class="form-check mb-3">
                            <input type="checkbox" class="form-check-input" id="${inputId}" ${c.value ? 'checked' : ''}>
                            <label class="form-check-label" for="${inputId}">${c.label}</label>
                        </div>`;
                }
                const tipo = c.type || 'text';
                const step = c.step ? ` step="${c.step}"` : (tipo === 'number' ? ' step="any"' : '');
                return `
                    <div class="form-group">
                        <label for="${inputId}">${c.label}</label>
                        <input type="${tipo}" class="form-control" id="${inputId}"${step} ${c.required === false ? '' : 'required'} ${i === 0 ? 'autofocus' : ''}>
                    </div>`;
            }).join('');

            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = id;
            modal.setAttribute('tabindex', '-1');
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content tec-modal">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title tec-modal-titulo"></h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar"><span>&times;</span></button>
                        </div>
                        <form class="tec-modal-form">
                            <div class="modal-body">${inputsHtml}</div>
                            <div class="modal-footer border-0 pt-0">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">${opts.btnTexto || 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>`;
            modal.querySelector('.tec-modal-titulo').textContent = titulo;
            document.body.appendChild(modal);

            // Asignar valores iniciales vía DOM (evita problemas de escape en HTML)
            campos.forEach(c => {
                const input = modal.querySelector(`#tecFm_${c.name}`);
                if (!input || c.type === 'checkbox') return;
                input.value = c.value ?? '';
            });

            let resultado = null;
            modal.querySelector('.tec-modal-form').addEventListener('submit', (e) => {
                e.preventDefault();
                resultado = {};
                campos.forEach(c => {
                    const input = modal.querySelector(`#tecFm_${c.name}`);
                    resultado[c.name] = c.type === 'checkbox' ? input.checked : input.value.trim();
                });
                $(modal).modal('hide');
            });
            $(modal).on('hidden.bs.modal', () => {
                modal.remove();
                resolve(resultado);
            });
            $(modal).modal('show');
        });
    };
})();
