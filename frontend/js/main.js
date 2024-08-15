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


      if(mobileBtn) {
        mobileBtn.forEach(function(elem, index) {

          elem.addEventListener('click', () => {
            // elem.classList.add("hidden")
            // elemClose.classList.remove("hidden")

            // Getting the width of the browser on load
            let currentWidth = widthResizer();

            // Getting the width of the browser whenever the screen resolution changes.
            // window.addEventListener('resize', widthResizer)

            // console.log(currentWidth)
            if(currentWidth < 1024) {
              elem.querySelector('.show').classList.toggle("hidden");
              elem.querySelector('.close').classList.toggle("hidden");

              submenuElem.forEach(function(elem2, index) {
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

      if(btnScroll) {
        btnScroll.forEach(function(elem, index) {
          elem.addEventListener('click', (event) => {
            event.preventDefault();
            let hash = event.currentTarget.getAttribute('href').replace('#', '');
            console.log(hash);

            const id = hash;
            const yOffset = -120; 
            const element = document.getElementById(id);
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({top: y, behavior: 'smooth'});

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

          txtNameMsg = document.querySelector("#txt-name-msg"),
          selectPeriodMsg = document.querySelector("#select-period-msg"),
          selectCampusMsg = document.querySelector("#select-campus-msg"),
          selectGradeMsg = document.querySelector("#select-grade-msg"),
          selectSubjectsMsg = document.querySelector("#select-subjects-msg");


      /* STEP 2 FIELDS AND MESSAGES */
      let txtAverageMark = document.querySelector("#txt-average-mark"),
          txtScholarship = document.querySelector("#txt-scholarship"),

          txtAverageMarkMsg = document.querySelector("#txt-average-mark-msg"),
          txtScholarshipMsg = document.querySelector("#txt-scholarship-msg"),
          txtSupportQuantityMsg = document.querySelector("#txt-support-quantity-msg");


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
          scholarshipGrade = 80, // promedio

          stepsContainer = document.querySelector(".steps-container"),
          stepNumber1 = document.querySelector(".step-num-1"),
          stepNumber2 = document.querySelector(".step-num-2"),
          stepNumber3 = document.querySelector(".step-num-3"),

          step1 = document.querySelector("#step-1"),
          step2 = document.querySelector("#step-2"),
          step3 = document.querySelector("#step-3"),
          btnNextStep = document.querySelectorAll(".btn-next-step");


      const canContinue = () => {
        if(hasError) {
          canPass = false;
          return false;
        } else {
          canPass = true;
          currentStep ++;

          moveStep();
        }
      }

      const moveStep  = () => {

        switch(currentStep) {
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


      btnNextStep.forEach(function(elem, index) {

        elem.addEventListener("click", () => {
          switch(currentStep) {
              /* ======== STEP 1 ======== */
            case 1:
              if(txtName.value == "") {
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

              if(selectPeriod.value == "") {
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

              if(selectCampus.value == "") {
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

              if(selectGrade.value == "") {
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

              if(selectSubjects.value == "") {
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


              canContinue();
              break;

              /* ======== STEP 2 ======== */
            case 2:
              if(txtAverageMark.value == "") {
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

              if(txtAverageMark.value >= scholarshipGrade) {
                if(txtScholarship.value == "") {
                  txtScholarship.classList.add("error");
                  txtScholarshipMsg.classList.add("error");
                  hasError = true;
                  canContinue();
                  break;
                } else {
                  txtScholarship.classList.remove("error");
                  txtScholarshipMsg.classList.remove("error");
                  hasError = false;
                }

              }


              canContinue();
              break;


              /* ======== STEP 3 ======== */
            case 3:
              if(txtVive.value == "") {
                txtVive.classList.add("error");
                txtViveMsg.classList.add("error");
                hasError = true;
                canContinue();
                break;
              } else {
                txtVive.classList.remove("error");
                txtViveMsg.classList.remove("error");
                hasError = false;
              }

              if(selectInsurance.value == "") {
                selectInsurance.classList.add("error");
                selectInsuranceMsg.classList.add("error");
                hasError = true;
                canContinue();
                break;
              } else {
                selectInsurance.classList.remove("error");
                selectInsuranceMsg.classList.remove("error");
                hasError = false;
              }

              if(selectInsuranceType.value == "") {
                selectInsuranceType.classList.add("error");
                selectInsuranceTypeMsg.classList.add("error");
                hasError = true;
                canContinue();
                break;
              } else {
                selectInsuranceType.classList.remove("error");
                selectInsuranceTypeMsg.classList.remove("error");
                hasError = false;
              }

              if(selectCoverage.value == "") {
                selectCoverage.classList.add("error");
                selectCoverageMsg.classList.add("error");
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


      let fieldAvg1 = document.querySelectorAll(".field-avg-1"),
        fieldAvg2 = document.querySelectorAll(".field-avg-2"),
        fieldAvg3 = document.querySelectorAll(".field-avg-3");

      txtAverageMark.addEventListener('keyup', () => {
        if (txtAverageMark.value != "") {
          if (parseFloat(txtAverageMark.value) >= scholarshipGrade) {
            fieldAvg1.forEach(function (elem, index) {
              elem.classList.remove("hidden");
            });
            fieldAvg2.forEach(function (elem, index) {
              elem.classList.remove("hidden");
            });
          } else if (parseFloat(txtAverageMark.value) >= 70 && parseFloat(txtAverageMark.value) < 80) {
            fieldAvg1.forEach(function (elem, index) {
              elem.classList.add("hidden");
            });
            fieldAvg2.forEach(function (elem, index) {
              elem.classList.add("hidden");
            });
            fieldAvg3.forEach(function (elem, index) {
              elem.classList.remove("hidden");
            });
          }
        } else {
          console.log("No se ingresó promedio");
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



/*
    const generatePDF = function() {
      // Selecciona el elemento que deseas convertir a PDF
      const element = document.body; // O puedes usar document.getElementById('id-del-elemento');

      // Configuración de opciones
      const opciones = {
        margin:       1,
        filename:     'pagina-web.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Convierte el contenido HTML a PDF
      html2pdf().from(element).set(opciones).save();
    }
*/
    
    /*
    const downloadPdfController = function () {
      const btnDownload = document.querySelector('.btn-download-pdf');

      btnDownload.addEventListener('click', function(e) {
        e.preventDefault();
        window.print();
      });
    }
    */

    const init = () => {
      mobileMenuController();
      scrollController();
      validateController();
      // downloadPdfController()
    }

    init();
  })();

});