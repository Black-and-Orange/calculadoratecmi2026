document.addEventListener("DOMContentLoaded", () => {
  (() => {
    const widthResizer = () => {
      var width = window.innerWidth
      return width;
    }

    const mobileMenuController = () => {
      const mobileBtn = document.querySelectorAll(".mobile-btn"),
        submenuElem = document.querySelectorAll(".submenu"),
        submenuExtraElem = document.querySelector(".submenu-extra"),
        selectorOpen = "show",
        selectorClose = "close";


      if (mobileBtn) {
        mobileBtn.forEach(function (elem, index) {

          elem.addEventListener('click', () => {
            // elem.classList.add("hidden")
            // elemClose.classList.remove("hidden")

            // Getting the width of the browser on load
            let currentWidth = widthResizer();

            // Getting the width of the browser whenever the screen resolution changes.
            // window.addEventListener('resize', widthResizer)
            if (currentWidth < 1024) {
              elem.querySelector('.show').classList.toggle("hidden");
              elem.querySelector('.close').classList.toggle("hidden");

              submenuElem.forEach(function (elem2, index) {
                elem2.classList.toggle("hidden");
              });

              submenuExtraElem.classList.toggle("hidden");

            } else {
              elem.querySelector('.show').classList.toggle("hidden");
              elem.querySelector('.close').classList.toggle("hidden");
              submenuExtraElem.classList.toggle("hidden");
            }
          });
        });
      }
    }


    const scrollController = () => {
      const btnScroll = document.querySelectorAll(".btn-scroll");

      if (btnScroll) {
        btnScroll.forEach(function (elem, index) {
          elem.addEventListener('click', (event) => {
            event.preventDefault();
            let hash = event.currentTarget.getAttribute('href').replace('#', '');

            const id = hash;
            const yOffset = -120;
            const element = document.getElementById(id);
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({ top: y, behavior: 'smooth' });

          });
        });
      }
    }


    const validateController = () => {
      /* STEP 1 FIELDS AND MESSAGES */
      let txtName = document.querySelector("#txt-name"),
        selectPeriod = document.querySelector("#select-period"),
        selectCampus = document.querySelector("#select-campus"),
        selectGrade = document.querySelector("#select-grade"),
        selectSubjects = document.querySelector("#select-subjects"),
        divMateriales = document.getElementById("div-materiales"),
        tipoBeca = document.getElementById("tipo-beca"),
        porcentajeBeca = document.getElementById("porcentaje-beca"),
        divCertificado = document.getElementById("div-certificado"),
        divSemanas = document.getElementById("div-semanas"),
        divIngles = document.getElementById("div-ingles"),
        selectPorcentaje = document.getElementById("txt-percentage"),
        selectCertificado = document.getElementById("select-certificado"),
        selectSemanas = document.getElementById("select-semanas"),
        selectIngles = document.getElementById("select-ingles"),
        porcentajeBecaMsg = document.getElementById("select-porcentaje-msg"),
        selectCertificadoMsg = document.getElementById("select-certificado-msg"),
        selectSemanasMsg = document.getElementById("select-semanas-msg"),
        selectInglesMsg = document.getElementById("select-ingles-msg"),

        txtNameMsg = document.querySelector("#txt-name-msg"),
        selectPeriodMsg = document.querySelector("#select-period-msg"),
        selectCampusMsg = document.querySelector("#select-campus-msg"),
        selectGradeMsg = document.querySelector("#select-grade-msg"),
        selectSubjectsMsg = document.querySelector("#select-subjects-msg");


      /* STEP 2 FIELDS AND MESSAGES */
      let txtAverageMark = document.querySelector("#txt-average-mark"),
        txtScholarship = document.querySelector("#txt-scholarship"),
        txtPercentageStudents = document.querySelector("#txt-percentage-students"),

        txtAverageMarkMsg = document.querySelector("#txt-average-mark-msg"),
        txtScholarshipMsg = document.querySelector("#txt-scholarship-msg"),
        txtPercentageStudentsMsg = document.querySelector("#txt-percentage-students-msg");


      /* STEP 3 FIELDS AND MESSAGES */
      // Los seguros ahora son dinámicos, se validan en el case 3


      let currentStep = 1,
        hasError = false,
        canPass = false,
        scholarshipGrade = 80,

        stepsContainer = document.querySelector(".steps-container"),
        stepNumber1 = document.querySelector(".step-num-1"),
        stepNumber2 = document.querySelector(".step-num-2"),
        stepNumber3 = document.querySelector(".step-num-3"),
        stepNumber4 = document.querySelector(".step-num-4"),
        stepNumber5 = document.querySelector(".step-num-5"),

        stepsBarRow = document.querySelector("#steps-bar-row"),
        wizardRow = document.querySelector("#wizard-row"),
        step0 = document.querySelector("#step-0"),
        stepDP = document.querySelector("#step-dp"),
        datosAlumno = document.querySelector("#datos-alumno"),
        datosProspecto = document.querySelector("#datos-prospecto"),
        step1 = document.querySelector("#step-1"),
        step2Prospecto = document.querySelector("#step-2"),
        step2Students = document.querySelector("#step-2-students"),
        step3 = document.querySelector("#step-3"),
        step4 = document.querySelector("#step-4"),
        btnPerfil = document.querySelectorAll(".btn-perfil"),
        btnStep1Next = document.querySelector("#step-1-next"),
        rowContactoAsesor = document.querySelector("#row-contacto-asesor"),
        checkTerminos = document.querySelector("#check-terminos"),
        checkPrivacidad = document.querySelector("#check-privacidad"),
        checkContacto = document.querySelector("#check-contacto"),
        checkTerminosMsg = document.querySelector("#check-terminos-msg"),
        checkPrivacidadMsg = document.querySelector("#check-privacidad-msg"),
        btnNextStep = document.querySelectorAll(".btn-next-step"),
        btnPrevStep = document.querySelectorAll(".btn-prev-step");

      // El step 2 depende del perfil: alumno → #step-2-students, prospecto → #step-2
      let step2 = step2Students;

      // Perfil activo. Ambos perfiles (alumno "Soy alumno" y prospecto "Me
      // interesa") usan el paso 1 combinado (datos personales + nivel de
      // estudios) → wizard de 4 pasos. Solo cambia el contenido por perfil
      // (datos personales, variante de apoyos y check de contacto por asesor).
      let perfilActual = localStorage.getItem("perfilUsuario") || "prospecto";


      const canContinue = () => {
        if (hasError) {
          canPass = false;
          return false;
        } else {
          canPass = true;
          currentStep++;

          moveStep();
        }
      }

      const returnSlide = () => {
        currentStep--;
        moveStep();
      }

      const stepCircles = [stepNumber1, stepNumber2, stepNumber3, stepNumber4, stepNumber5];

      const moveStep = () => {
        // Wizard de 4 pasos para ambos perfiles: el paso 1 combina datos
        // personales + nivel de estudios en una sola pantalla. Un panel puede ser
        // un arreglo (varios paneles que se muestran juntos en un mismo paso).
        // El contenido por perfil (datos, variante de apoyos, contacto) se
        // resuelve fuera de aquí; la navegación es idéntica para alumno y prospecto.
        const stepPanels = [[stepDP, step1], step2, step3, step4];

        // Ocultar ambas variantes del paso de apoyos; solo la activa se muestra
        if (step2Prospecto) step2Prospecto.classList.add("hidden");
        if (step2Students) step2Students.classList.add("hidden");

        stepPanels.forEach((panel, index) => {
          const visible = index === currentStep - 1;
          const paneles = Array.isArray(panel) ? panel : [panel];
          paneles.forEach((p) => { if (p) p.classList.toggle("hidden", !visible); });
        });

        // El encabezado combinado "Ayúdanos a identificarte" (datos + nivel) solo
        // va en el paso 1; en los pasos 2-4 no debe aparecer.
        const headingAlumno = document.querySelector(".heading-alumno");
        if (headingAlumno) headingAlumno.classList.toggle("en-paso-1", currentStep === 1);

        stepCircles.forEach((circle, index) => {
          if (!circle) return;
          circle.classList.toggle("active", index === currentStep - 1);
          circle.classList.toggle("passed", index < currentStep - 1);
        });

        // Barra de progreso de 4 pasos (ambos perfiles ocultan el círculo 5)
        stepsContainer.classList.add("steps-alumno");
        stepsContainer.classList.toggle("step-2", currentStep >= 2);
        stepsContainer.classList.toggle("step-3", currentStep >= 3);
        stepsContainer.classList.toggle("step-4", currentStep >= 4);
        stepsContainer.classList.toggle("step-5", currentStep >= 5);

        // HU16/54: recalcular el gating del botón al entrar al nivel de estudios
        // (paso 1 combinado para ambos perfiles)
        if (currentStep === 1) checkNivelCompleto();

        // Inicializar step2-students al entrar al paso de apoyos (paso 2). Solo
        // aplica al alumno: su variante de apoyos es #step-2-students.
        if (currentStep === 2 && step2 && step2.id === 'step-2-students') {
          document.dispatchEvent(new CustomEvent('stepChanged', { detail: { step: 2 } }));
        }
      }

      // HU16/54: el botón continuar del nivel de estudios queda deshabilitado
      // hasta que todos los campos visibles estén llenos. Los campos varían
      // según el nivel (materias, certificados, créditos, formato, etc.).
      const checkNivelCompleto = () => {
        if (!btnStep1Next || !step1) return;

        let completo = true;

        // Todos los selects visibles Y HABILITADOS del panel deben tener valor.
        // Se excluyen los deshabilitados (p.ej. Certificados/Semanas SEDI de los
        // periodos NO marcados del nivel 13 Ejecutivo Bimestral MAPS): el usuario
        // no puede llenarlos, así que no deben bloquear "Continuar".
        step1.querySelectorAll("select").forEach((select) => {
          if (select.offsetParent !== null && !select.disabled && select.value === "") completo = false;
        });

        // Nivel 13 (bimestral): el periodo es un grupo de checkboxes (de 2 a 5)
        const periodosContainer = step1.querySelector("#periodos-checkbox-container");
        const esNivel13 = periodosContainer && periodosContainer.offsetParent !== null;
        if (esNivel13) {
          const marcados = periodosContainer.querySelectorAll('input[type="checkbox"]:checked').length;
          if (marcados < 2) completo = false;
        }

        // El costo debe ser mayor a cero (p.ej. MAPS con 0 certificados, 0
        // semanas y 0 inglés produce una cotización vacía). Nivel 13 calcula
        // por bimestre y no usa costoTotal global.
        if (completo && !esNivel13) {
          let costo = 0;
          try { costo = parseFloat(JSON.parse(localStorage.getItem("costoTotal"))) || 0; } catch (e) { }
          if (costo <= 0) completo = false;
        }

        btnStep1Next.disabled = !completo;
      }

      if (step1) {
        step1.addEventListener("change", checkNivelCompleto);
        step1.addEventListener("input", checkNivelCompleto);
        // Los selects se llenan vía API después de elegir nivel; revisar
        // periódicamente cubre los cambios programáticos que no disparan eventos
        setInterval(checkNivelCompleto, 700);
      }

      // Campus es cascada del nivel: sus opciones (y cuáles aplican) dependen del
      // nivel elegido. En el paso 1 combinado (ambos perfiles) campus aparece
      // junto al nivel, así que se mantiene deshabilitado con una pista hasta
      // elegir nivel; entonces step1.js lo llena y aquí se habilita.
      const campusHint = document.getElementById("campus-hint");
      const syncCampusGate = () => {
        const bloquear = (!selectGrade || selectGrade.value === "");
        if (selectCampus) selectCampus.disabled = bloquear;
        if (campusHint) campusHint.classList.toggle("hidden", !bloquear);
      };
      if (selectGrade) selectGrade.addEventListener("change", syncCampusGate);

      // PASO 0 (HU1): selección de perfil. Define qué variante del step 2 se usa
      // y muestra el wizard.
      const showWizard = () => {
        step0.classList.add("hidden");
        stepsBarRow.classList.remove("hidden");
        wizardRow.classList.remove("hidden");
        currentStep = 1;
        moveStep();
      }

      const showPerfil = () => {
        step0.classList.remove("hidden");
        stepsBarRow.classList.add("hidden");
        wizardRow.classList.add("hidden");
      }

      btnPerfil.forEach((btn) => {
        btn.addEventListener("click", () => {
          const perfil = btn.dataset.perfil; // 'alumno' | 'prospecto'
          localStorage.setItem("perfilUsuario", perfil);
          perfilActual = perfil;

          step2 = (perfil === "prospecto" && step2Prospecto) ? step2Prospecto : step2Students;

          // Rediseño del paso 1 (datos + nivel combinados, grid) para ambos
          // perfiles. La clase .flujo-alumno es histórica (el rediseño nació en el
          // flujo alumno); hoy también la usa prospecto ("me interesa"), que
          // comparte el mismo layout de 4 pasos.
          if (wizardRow) wizardRow.classList.add("flujo-alumno");

          // Datos personales según perfil: alumno (HU4) o prospecto (HU42)
          if (datosAlumno) datosAlumno.classList.toggle("hidden", perfil !== "alumno");
          if (datosProspecto) datosProspecto.classList.toggle("hidden", perfil !== "prospecto");

          // El check de contacto por asesor (HU68) solo aplica a prospectos
          if (rowContactoAsesor) {
            rowContactoAsesor.classList.toggle("hidden", perfil !== "prospecto");
          }

          showWizard();
          syncCampusGate();
        });
      });

      // HU40/79 "Conservar mis datos": al volver de "Nueva cotización" conservando
      // datos, reutilizar perfil + datos personales: saltar el selector de perfil y
      // pre-llenar los campos, dejando al usuario solo re-elegir el plan de estudios.
      const reusarDatosConservados = () => {
        if (localStorage.getItem("reusarDatos") !== "1") return;
        localStorage.removeItem("reusarDatos"); // one-shot: no afectar navegación normal

        const perfil = localStorage.getItem("perfilUsuario");
        if (!perfil) return;

        // Auto-seleccionar el perfil guardado (reusa el handler del botón → showWizard,
        // de modo que se salta el paso 0 de selección de perfil).
        const btn = [...btnPerfil].find((b) => b.dataset.perfil === perfil);
        if (btn) btn.click();

        // Pre-llenar los datos personales según el perfil.
        let dp = null;
        try { dp = JSON.parse(localStorage.getItem("datosPersonales") || "null"); } catch (e) { dp = null; }
        if (!dp) return;

        const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
        if (perfil === "alumno") {
          set("txt-matricula", dp.matricula);
          set("txt-nombre-alumno", dp.nombre);
          set("txt-apellido-alumno", dp.apellidos);
        } else {
          set("txt-nombre-prospecto", dp.nombre);
          set("txt-apellido-paterno", dp.apellidoPaterno);
          set("txt-apellido-materno", dp.apellidoMaterno);
          set("txt-fecha-nacimiento", dp.fechaNacimiento);
          set("txt-telefono", dp.telefono);
          set("txt-correo", dp.correo);
        }
        // El nombre completo oculto (#txt-name) que usa resultados.js/saludo.
        const nombreCompleto = perfil === "alumno"
          ? [dp.nombre, dp.apellidos].filter(Boolean).join(" ")
          : [dp.nombre, dp.apellidoPaterno, dp.apellidoMaterno].filter(Boolean).join(" ");
        set("txt-name", nombreCompleto);
      };
      reusarDatosConservados();

      // ===== Validación de datos personales (HU4 / HU42) =====
      const marcarCampo = (input, valido) => {
        const msg = document.getElementById(input.id + "-msg");
        input.classList.toggle("error", !valido);
        if (msg) msg.classList.toggle("error", !valido);
        return valido;
      }

      const validarDatosPersonales = () => {
        const perfil = localStorage.getItem("perfilUsuario");
        let valido = true;
        const noVacio = (v) => v.trim().length > 0;

        if (perfil === "prospecto") {
          const nombre = document.getElementById("txt-nombre-prospecto");
          const paterno = document.getElementById("txt-apellido-paterno");
          const materno = document.getElementById("txt-apellido-materno");
          const fecha = document.getElementById("txt-fecha-nacimiento");
          const telefono = document.getElementById("txt-telefono");
          const correo = document.getElementById("txt-correo");

          valido = marcarCampo(nombre, noVacio(nombre.value)) && valido;
          valido = marcarCampo(paterno, noVacio(paterno.value)) && valido;
          valido = marcarCampo(materno, noVacio(materno.value)) && valido;
          valido = marcarCampo(fecha, noVacio(fecha.value)) && valido;
          valido = marcarCampo(telefono, /^[0-9]{10}$/.test(telefono.value)) && valido;
          valido = marcarCampo(correo, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value) && correo.value.length <= 50) && valido;

          if (valido) {
            const nombreCompleto = `${nombre.value.trim()} ${paterno.value.trim()} ${materno.value.trim()}`;
            document.getElementById("txt-name").value = nombreCompleto;
            localStorage.setItem("datosPersonales", JSON.stringify({
              perfil: "prospecto",
              nombre: nombre.value.trim(),
              apellidoPaterno: paterno.value.trim(),
              apellidoMaterno: materno.value.trim(),
              fechaNacimiento: fecha.value,
              telefono: telefono.value,
              correo: correo.value.trim(),
            }));
          }
        } else {
          const matricula = document.getElementById("txt-matricula");
          const nombre = document.getElementById("txt-nombre-alumno");
          const apellido = document.getElementById("txt-apellido-alumno");

          valido = marcarCampo(matricula, /^[A-Za-z0-9]{8}$/.test(matricula.value)) && valido;
          valido = marcarCampo(nombre, noVacio(nombre.value)) && valido;
          valido = marcarCampo(apellido, noVacio(apellido.value)) && valido;

          if (valido) {
            const nombreCompleto = `${nombre.value.trim()} ${apellido.value.trim()}`;
            document.getElementById("txt-name").value = nombreCompleto;
            localStorage.setItem("datosPersonales", JSON.stringify({
              perfil: "alumno",
              matricula: matricula.value.trim().toUpperCase(),
              nombre: nombre.value.trim(),
              apellidos: apellido.value.trim(),
            }));
          }
        }

        return valido;
      }


      btnNextStep.forEach(function (elem, index) {
        // Evento para clic normal
        elem.addEventListener("click", (event) => {
          // Mapear el paso VISIBLE al "paso lógico" del switch. Wizard de 4 pasos
          // (ambos perfiles): el paso 1 combinado valida primero datos personales
          // y, si pasan, continúa con la validación de nivel (case 2); los pasos
          // visibles 2/3/4 mapean a los casos 3/4/5 (apoyos/seguros/términos).
          let pasoLogico;
          if (currentStep === 1) {
            if (!validarDatosPersonales()) { hasError = true; canContinue(); return; }
            pasoLogico = 2;
          } else {
            pasoLogico = currentStep + 1;
          }

          switch (pasoLogico) {
            /* ======== PASO 1: DATOS PERSONALES (HU4/HU42) ======== */
            case 1:
              hasError = !validarDatosPersonales();
              canContinue();
              break;

            /* ======== PASO 2: NIVEL DE ESTUDIOS ======== */
            case 2:
              // --- VALIDACIÓN DE PERÍODOS SEGÚN NIVEL ---
              const nivelSelect = document.getElementById('select-grade');
              let nivelValue = nivelSelect ? nivelSelect.value : '';
              let isNivel13 = false;
              if (nivelValue) {
                // Buscar el texto del nivel seleccionado
                const selectedOption = nivelSelect.options[nivelSelect.selectedIndex];
                if (selectedOption && selectedOption.textContent.toLowerCase().includes('ejecutivo bimestral maps')) {
                  isNivel13 = true;
                }
              }
              if (isNivel13) {
                // Validar consecutividad y configuración
                const checkboxes = document.querySelectorAll('#periodos-checkbox-container input[type="checkbox"]:checked');
                const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-index'))).sort((a, b) => a - b);
                let sonConsecutivos = true;
                for (let i = 1; i < selectedIndexes.length; i++) {
                  if (selectedIndexes[i] !== selectedIndexes[i - 1] + 1) {
                    sonConsecutivos = false;
                    break;
                  }
                }

                // Usar la función de validación de step1.js que maneja los mensajes de configuración
                const configuracionValida = window.validarPeriodosConErrores ? window.validarPeriodosConErrores() : true;

                if (selectedIndexes.length === 0 || !sonConsecutivos || !configuracionValida) {
                  hasError = true;
                  canContinue();
                  break;
                } else {
                  hasError = false;
                }
              } else {
                // Validación tradicional para otros niveles
                if (selectPeriod.value == "") {
                  selectPeriod.classList.add("error");
                  selectPeriodMsg.classList.add("error");
                  hasError = true;
                  canContinue();
                  break;
                } else {
                  selectPeriod.classList.remove("error");
                  selectPeriodMsg.classList.remove("error");
                  hasError = false;
                }
              }

              if (selectCampus.value == "") {
                selectCampus.classList.add("error");
                selectCampusMsg.classList.add("error");
                hasError = true;
                canContinue();
                break;
              } else {
                selectCampus.classList.remove("error");
                selectCampusMsg.classList.remove("error");
                hasError = false;
              }

              if (selectGrade.value == "") {
                selectGrade.classList.add("error");
                selectGradeMsg.classList.add("error");
                hasError = true;
                canContinue();
                break;
              } else {
                selectGrade.classList.remove("error");
                selectGradeMsg.classList.remove("error");
                hasError = false;
              }

              if (divMateriales.style.display !== "none") {

                if (selectSubjects.value == "") {
                  selectSubjects.classList.add("error");
                  selectSubjectsMsg.classList.add("error");
                  hasError = true;
                  canContinue();
                  break;
                } else {
                  selectSubjects.classList.remove("error");
                  selectSubjectsMsg.classList.remove("error");
                  hasError = false;
                }
              }
              


              canContinue();
              break;

            /* ======== PASO 3: APOYOS Y PRÉSTAMOS ======== */
            case 3:
              // Validar step-2-students (nuevo)
              if (step2 && step2.id === 'step-2-students') {
                hasError = false;
                
                // Validar que se seleccione el porcentaje de beca (obligatorio)
                if (txtPercentageStudents) {
                  if (txtPercentageStudents.value == "" || txtPercentageStudents.value == "Elige") {
                    txtPercentageStudents.classList.add("error");
                    txtPercentageStudentsMsg.classList.add("error");
                    txtPercentageStudentsMsg.textContent = "Este campo es necesario";
                    hasError = true;
                  } else {
                    txtPercentageStudents.classList.remove("error");
                    txtPercentageStudentsMsg.classList.remove("error");
                  }
                }
                
                // El préstamo es opcional, no se valida
                
                if (hasError) {
                  canContinue();
                  break;
                }
              } else {
                // Validar step-2 original (respaldo)
                if (txtAverageMark && txtAverageMark.value == "") {
                  txtAverageMark.classList.add("error");
                  txtAverageMarkMsg.classList.add("error");
                  hasError = true;
                  canContinue();
                  break;
                } else {
                  if (txtAverageMark) {
                    txtAverageMark.classList.remove("error");
                    txtAverageMarkMsg.classList.remove("error");
                  }
                  hasError = false;
                }
              }

              canContinue();
              break;


            /* ======== PASO 4: SEGUROS ======== */
            case 4:
              hasError = false;

              // Validar SELECTs dinámicos de seguros
              const segurosSelects = document.querySelectorAll('[id^="select-seguro-"]');
              let hasUnselectedSeguro = false;
              
              segurosSelects.forEach(select => {
                if (select.value === "" || select.value === "Elige") {
                  select.classList.add("error");
                  const msgId = select.id + "-msg";
                  const msgElement = document.getElementById(msgId);
                  if (msgElement) {
                    msgElement.classList.add("error");
                    msgElement.textContent = "Debe seleccionar una opción.";
                  }
                  hasError = true;
                  hasUnselectedSeguro = true;
                } else {
                  select.classList.remove("error");
                  const msgId = select.id + "-msg";
                  const msgElement = document.getElementById(msgId);
                  if (msgElement) {
                    msgElement.classList.remove("error");
                  }
                }
              });

              if (hasError) {
                canContinue();
                break;
              }

              canContinue();
              break;

            /* ======== PASO 5: TÉRMINOS (HU28/29/66/67) ======== */
            case 5:
              hasError = false;

              if (!checkTerminos.checked) {
                checkTerminosMsg.classList.add("error");
                hasError = true;
              } else {
                checkTerminosMsg.classList.remove("error");
              }

              if (!checkPrivacidad.checked) {
                checkPrivacidadMsg.classList.add("error");
                hasError = true;
              } else {
                checkPrivacidadMsg.classList.remove("error");
              }

              if (hasError) {
                // Bloquear el submit del formulario hasta aceptar los legales
                event.preventDefault();
                break;
              }

              localStorage.setItem("aceptoTerminos", "true");
              localStorage.setItem("aceptoPrivacidad", "true");
              localStorage.setItem("contactoAsesor", checkContacto && checkContacto.checked ? "true" : "false");
              // Sin errores: el input type=submit envía el formulario a resultado.html
              break;
          }
        });
      });


      btnPrevStep.forEach(function (elem, index) {

        elem.addEventListener("click", () => {
          if (currentStep === 1) {
            // Desde datos personales se regresa a la selección de perfil (HU17/55)
            showPerfil();
          } else {
            returnSlide();
          }
        });
      });



      let fieldAvg1 = document.querySelectorAll(".field-avg-1"),
        fieldAvg2 = document.querySelectorAll(".field-avg-2"),
        fieldAvg3 = document.querySelectorAll(".field-avg-3");

      // El campo de promedio vive en #step-2 (flujo prospecto); el listener es
      // inocuo cuando el perfil es alumno porque ese panel queda oculto.
      if (txtAverageMark) {
        txtAverageMark.addEventListener('keyup', () => {
          if (txtAverageMark.value != "") {
            fieldAvg1.forEach(function (elem, index) {
              elem.classList.remove("hidden");
            });
            fieldAvg2.forEach(function (elem, index) {
              elem.classList.remove("hidden");
            });
          } else {
            fieldAvg1.forEach(function (elem, index) {
              elem.classList.add("hidden");
            });
            fieldAvg2.forEach(function (elem, index) {
              elem.classList.add("hidden");
            });
            fieldAvg3.forEach(function (elem, index) {
              elem.classList.add("hidden");
            });
          }
        });
      }
    }

    const printController = () => {
      window.jsPDF = window.jspdf.jsPDF;
      const btnPrint = document.querySelector('#btn-print'),
        contentElem = document.querySelector('#contenido');

      let viewportElem = document.getElementById('viewportElem');

      if (btnPrint) {
        btnPrint.addEventListener('click', function (e) {
          e.preventDefault();


          viewportElem.setAttribute('content', 'width=1440');


          const elementosOcultos = document.querySelectorAll('.no-print'); // Asume que los elementos ocultos tienen la clase "hidden"
          elementosOcultos.forEach(el => {
            el.dataset.originalDisplay = el.style.display;
            el.style.display = 'none';
          });

          const elementosOcultosHbspt = document.querySelectorAll('.hs-tools-menu'); // Asume que los elementos ocultos tienen la clase "hidden"
          elementosOcultosHbspt.forEach(el => {
            el.dataset.originalDisplay = el.style.display;
            el.style.display = 'none';
          });


          html2canvas(contentElem).then(function (canvas) {
            var imgData = canvas.toDataURL('image/png');
            var pdf = new jsPDF({
              orientation: 'portrait', // o 'landscape' si prefieres
              unit: 'mm',
              format: 'a4' // Puedes usar 'letter' u otros tamaños si es necesario
            });

            var imgWidth = 210; // Ancho en mm para formato A4
            var pageHeight = 295; // Alto en mm para formato A4
            var imgHeight = canvas.height * imgWidth / canvas.width;
            var heightLeft = imgHeight;

            var position = 0;

            // Agregar la imagen al PDF, ajustando el ancho y alto
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
            heightLeft -= pageHeight;

            // Si la imagen es más alta que una página, añade páginas adicionales
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
              heightLeft -= pageHeight;
            }

            // Guarda el PDF
            pdf.save('documento.pdf');

            viewportElem.setAttribute('content', 'width=device-width, initial-scale=1.0');
          });



        });
      }
    }

    const assignColumnsController = () => {
      const columnsContainer = document.querySelector('.columns-container');

      if (columnsContainer) {
        let columnsNumber = 5, // Número total de elementos
          columnBreak = 3; // Número de quiebre de fila
        let i = 1;

        let newRow;

        while (i <= columnsNumber) {
          if (i % columnBreak == 1) {
            newRow = document.createElement("div");
            newRow.classList.add("flex", "flex-row", "flex-wrap", "justify-center");
            columnsContainer.append(newRow);
          }

          let newColumn = document.createElement("div")
          newColumn.classList.add("px-4", "w-full", "md:w-1/2", "xl:w-1/4", "relative", "mt-24");
          newRow.appendChild(newColumn);

          let newImage = document.createElement("img")
          newImage.classList.add("w-[45px]", "h-[45px]", "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2");
          newImage.setAttribute("src", "./img/benefits-icon.svg")

          let imageContainer = document.createElement("div")
          imageContainer.classList.add("bg-secondary-color-3", "w-[96px]", "h-[96px]", "inline-block", "mx-auto", "absolute", "rounded-full", "-top-[75px]", "left-1/2", "-translate-x-1/2")
          imageContainer.appendChild(newImage)

          let cardTitle = document.createElement("p")
          cardTitle.classList.add("font-bold", "text-[18px]", "leading-[26px]");
          cardTitle.innerHTML = "Certificaciones"

          let cardText = document.createElement("p")
          cardText.innerHTML = "Te ofrecemos 3 certificaciones que te preparan con habilidades para el futuro: Tecnología (Python), Creatividad e Innovación y Finanzas personales";

          let newCard = document.createElement("div");
          newCard.classList.add("border-2", "border-solid", "border-secondary-color-3", "rounded-[6px]", "relative", "px-[20px]", "py-[30px]", "h-full")
          newCard.appendChild(imageContainer)
          newCard.appendChild(cardTitle)
          newCard.appendChild(cardText)

          newColumn.appendChild(newCard)



          i++;
        }
      }
    }


    const init = () => {
      mobileMenuController();
      scrollController();
      validateController();
      // printController();
      assignColumnsController();
    }

    init();
  })();

});