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

        txtAverageMarkMsg = document.querySelector("#txt-average-mark-msg"),
        txtScholarshipMsg = document.querySelector("#txt-scholarship-msg");


      /* STEP 3 FIELDS AND MESSAGES */
      let txtVive = document.querySelector("#txt-vive"),
        selectInsurance = document.querySelector("#select-insurance"),
        selectInsuranceType = document.querySelector("#select-insurance-type"),
        selectCoverage = document.querySelector("#select-coverage"),

        txtViveMsg = document.querySelector("#txt-vive-msg"),
        selectInsuranceMsg = document.querySelector("#select-insurance-msg"),
        selectInsuranceTypeMsg = document.querySelector("#select-insurance-type-msg"),
        selectCoverageMsg = document.querySelector("#select-coverage-msg");


      let currentStep = 1,
        hasError = false,
        canPass = false,
        scholarshipGrade = 80,

        stepsContainer = document.querySelector(".steps-container"),
        stepNumber1 = document.querySelector(".step-num-1"),
        stepNumber2 = document.querySelector(".step-num-2"),
        stepNumber3 = document.querySelector(".step-num-3"),

        step1 = document.querySelector("#step-1"),
        step2 = document.querySelector("#step-2"),
        step3 = document.querySelector("#step-3"),
        btnNextStep = document.querySelectorAll(".btn-next-step"),
        btnPrevStep = document.querySelectorAll(".btn-prev-step");


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

      const moveStep = () => {

        switch (currentStep) {
          case 1:
            step1.classList.remove("hidden");
            step2.classList.add("hidden");
            step3.classList.add("hidden");

            stepNumber1.classList.add("active");
            stepNumber2.classList.remove("active");
            stepNumber3.classList.remove("active");

            stepNumber1.classList.remove("passed");
            stepNumber2.classList.remove("passed");
            stepNumber3.classList.remove("passed");

            stepsContainer.classList.remove("step-2");
            stepsContainer.classList.remove("step-3");
            break;
          case 2:
            step1.classList.add("hidden");
            step2.classList.remove("hidden");
            step3.classList.add("hidden");

            stepNumber1.classList.remove("active");
            stepNumber2.classList.add("active");
            stepNumber3.classList.remove("active");

            stepNumber1.classList.add("passed");
            stepNumber2.classList.remove("passed");
            stepNumber3.classList.remove("passed");
            stepsContainer.classList.add("step-2");
            stepsContainer.classList.remove("step-3");
            break;
          case 3:
            step1.classList.add("hidden");
            step2.classList.add("hidden");
            step3.classList.remove("hidden");

            stepNumber1.classList.remove("active");
            stepNumber2.classList.remove("active");
            stepNumber3.classList.add("active");

            stepNumber1.classList.add("passed");
            stepNumber2.classList.add("passed");
            stepNumber3.classList.remove("passed");
            stepsContainer.classList.add("step-2");
            stepsContainer.classList.add("step-3");
            break;
        }
      }


      btnNextStep.forEach(function (elem, index) {

        elem.addEventListener("click", () => {
          switch (currentStep) {
            /* ======== STEP 1 ======== */
            case 1:
              if (txtName.value == "") {
                txtName.classList.add("error");
                txtNameMsg.classList.add("error");
                hasError = true;
                canContinue();
                break;
              } else {
                txtName.classList.remove("error");
                txtNameMsg.classList.remove("error");
                hasError = false;
              }

              // --- VALIDACIÓN DE PERÍODOS SEGÚN NIVEL ---
              const nivelSelect = document.getElementById('select-grade');
              let nivelValue = nivelSelect ? nivelSelect.value : '';
              let isNivel13 = false;
              if (nivelValue) {
                // Buscar el texto del nivel seleccionado
                const selectedOption = nivelSelect.options[nivelSelect.selectedIndex];
                if (selectedOption && selectedOption.textContent.toLowerCase().includes('ejecutivo maps bimestral')) {
                  isNivel13 = true;
                }
              }
              if (isNivel13) {
                // Validar los checkboxes
                const checkboxes = document.querySelectorAll('#periodos-checkbox-container input[type="checkbox"]:checked');
                const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-index'))).sort((a, b) => a - b);
                let sonConsecutivos = true;
                for (let i = 1; i < selectedIndexes.length; i++) {
                  if (selectedIndexes[i] !== selectedIndexes[i-1] + 1) {
                    sonConsecutivos = false;
                    break;
                  }
                }
                if (selectedIndexes.length === 0 || !sonConsecutivos) {
                  // Agregar clase de error al contenedor
                  const checkboxContainer = document.getElementById('periodos-checkbox-container');
                  if (checkboxContainer) checkboxContainer.style.borderColor = '#dc3545';
                  
                  // Mensaje de error visual
                  let errorMsg = document.getElementById('periodos-error-msg');
                  if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.id = 'periodos-error-msg';
                    errorMsg.style.cssText = `
                      margin-top: 8px;
                      padding: 8px 12px;
                      background: #f8d7da;
                      border: 1px solid #f5c6cb;
                      border-radius: 4px;
                      color: #721c24;
                      font-size: 14px;
                      font-weight: 500;
                    `;
                    errorMsg.textContent = selectedIndexes.length === 0 ? '⚠️ Este campo es necesario' : '⚠️ Solo puedes seleccionar períodos consecutivos';
                    checkboxContainer.appendChild(errorMsg);
                  } else {
                    errorMsg.textContent = selectedIndexes.length === 0 ? '⚠️ Este campo es necesario' : '⚠️ Solo puedes seleccionar períodos consecutivos';
                  }
                  hasError = true;
                  canContinue();
                  break;
                } else {
                  // Remover clase de error del contenedor
                  const checkboxContainer = document.getElementById('periodos-checkbox-container');
                  if (checkboxContainer) checkboxContainer.style.borderColor = '#e9ecef';
                  
                  let errorMsg = document.getElementById('periodos-error-msg');
                  if (errorMsg) errorMsg.remove();
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

            /* ======== STEP 2 ======== */
            case 2:
              if (txtAverageMark.value == "") {
                txtAverageMark.classList.add("error");
                txtAverageMarkMsg.classList.add("error");
                hasError = true;
                canContinue();
                break;
              } else {
                txtAverageMark.classList.remove("error");
                txtAverageMarkMsg.classList.remove("error");
                hasError = false;
              }

              canContinue();
              break;


            /* ======== STEP 3 ======== */
            case 3:
              if (txtVive.value == "" || txtVive.value == "Elige") {


                txtVive.classList.add("error");
                txtViveMsg.classList.add("error");
                txtViveMsg.textContent = "Debe seleccionar una opción.";
                hasError = true;
                canContinue();
                break;
              } else {
                txtVive.classList.remove("error");
                txtViveMsg.classList.remove("error");
                hasError = false;
              }



              if (selectInsurance.value === "" || selectInsurance.value === "Elige") {
                event.preventDefault();
                selectInsurance.classList.add("error");
                selectInsuranceMsg.classList.add("error");
                selectInsuranceMsg.textContent = "Debe seleccionar una opción.";
                hasError = true;
              } else {
                selectInsurance.classList.remove("error");
                selectInsuranceMsg.classList.remove("error");
              }

              if (!hasError) {
                canContinue();
              }


              if (selectCoverage.value == "" || selectCoverage.value == "Elige") {
                selectCoverage.classList.add("error");
                selectCoverageMsg.classList.add("error");
                selectCoverageMsg.textContent = "Debe seleccionar una opción.";
                hasError = true;
                canContinue();
                break;
              } else {

                selectCoverage.classList.remove("error");
                selectCoverageMsg.classList.remove("error");
                hasError = false;
              }

              canContinue();
              break;
          }
        });
      });


      btnPrevStep.forEach(function (elem, index) {

        elem.addEventListener("click", () => {
          switch (currentStep) {
            /* ======== STEP 1 ======== */
            case 1:
              returnSlide();
              break;

            /* ======== STEP 2 ======== */
            case 2:
              returnSlide();
              break;

            /* ======== STEP 3 ======== */
            case 3:
              returnSlide();
              break;


          }
        });
      });



      let fieldAvg1 = document.querySelectorAll(".field-avg-1"),
        fieldAvg2 = document.querySelectorAll(".field-avg-2"),
        fieldAvg3 = document.querySelectorAll(".field-avg-3");

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