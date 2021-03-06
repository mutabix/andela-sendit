
import sideBar from '../../components/leftSideBar.js';
import map from '../../components/googleMap.js';
import { provinces } from '../../mocks/index.js';
import fetchAPI from '../../utils/fetchAPI.js';
import model from '../../utils/model.js';
import getPrice from '../../utils/getPrice.js'
let parcel = {};

const Page = {
  render : async () => `
    <div class="container">
      <div class="row">
        <div class="col-3">
          ${await sideBar.render()}
        </div>
        <div class="col-9">
          <br>
          <div class="box order-container">
            <h2 class="title-1 align-center">Create a parcel</h3>
            <div class="quote-result">
              <p>From <strong>-</strong> to <strong>-</strong>, a parcel of 
                <strong>-</strong> costs <strong>-</strong>
              </p>
            </div>
            <div class="form-error error-message"></div>
            <form action="#">
              <div class="row">
                <div class="col-6">
                  <span class="custom-dropdown">
                    <select
                      id="from_province"
                      name="from_province
                      required
                      placeholder="From Province"
                    >
                      <option value="">Province - Origin</option> 
                      <option value="eastern">Eastern Province</option>
                      <option value="kigali">Kigali</option>  
                      <option value="northern">Northen Province</option>
                      <option value="southern">Southern Province</option>
                    </select>
                  </span>
                  <div class="form-error from_province"></div>
                  
                  <span class="custom-dropdown">
                    <select id="from_district" name="from_district" required>    
                      <option value="">District - Origin</option>
                    </select>
                  </span>
                  <div class="form-error from_district"></div>
                </div>
                <div class="col-6">
                  <span class="custom-dropdown">
                    <select id="to_province" name="to_province" required>
                      <option value="">Province - Destination</option> 
                      <option value="eastern">Eastern Province</option>
                      <option value="kigali">Kigali</option>  
                      <option value="northern">Northen Province</option>
                      <option value="southern">Southern Province</option>
                    </select>
                  </span>
                  <div class="form-error to_province"></div>
                  
                  <span class="custom-dropdown">
                    <select id="to_district" name="to_district" required>    
                      <option value="">District - Destination</option>
                    </select>
                  </span>
                  <div class="form-error to_district"></div>
                </div>
              </div>

              <div class="row">
                <div class="col-6">
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    placeholder="Weight"
                    required
                  >
                  <div class="form-error weight"></div>
                </div>
                <div class="col-6">
                  <input
                    type="number"
                    name="phone"
                    id="receiver_phone"
                    placeholder="Phone Number"
                    required
                  >
                  <div class="form-error receiver_phone"></div>
                </div>
              </div>

              <div class="row">
                <div class="col-6">
                  <input
                    type="text"
                    name="receiver_names"
                    id="receiver_names"
                    placeholder="Receiver's Names"
                    required
                  >
                  <div class="form-error receiver_names"></div>
                </div>
              </div>

              <div class="row">
                <div class="col-12">
                  <textarea
                    placeholder="Enter full address"
                    rows="5"
                    name="receiver_address"
                    id="receiver_address"
                    maxlength="200"
                    required
                    ></textarea>
                  <div class="form-error receiver_address"></div>

                  <button id="submit-form" class="btn primary">
                    ${parcel.id ? 'Update' : 'Submit' }
                  </button>
                </div>
              </div>
            </form>
            ${await map.render()}
          </div>
        </div>
      </div>
    </div>
  `,
  after_render: async () => {
    const pricePerKg = 1000;
    const form = {
      from_province: '',
      from_district: '',
      to_district: '',
      to_province: '',
      receiver_names: '',
      receiver_phone: '',
      receiver_address: '',
      weight: 0,
    }

    const formKeys = Object.keys(form);
    // From province and distrinct
    const fromProvince = document.querySelector('#from_province');
    const fromDistrict = document.querySelector('#from_district');
    // To province and distrinct
    const toProvince = document.querySelector('#to_province');
    const toDistrict = document.querySelector('#to_district');

    const receiverNames = document.querySelector('#receiver_names');
    const receiverPhone = document.querySelector('#receiver_phone');
    const weight = document.querySelector('#weight');
    const receiverAddress = document.querySelector('#receiver_address');
    const quoteResult = document.querySelector('.quote-result');

    const submitForm = document.querySelector('#submit-form');
    const errorMessage = document.querySelector('.form-error.error-message');
    const loading = document.querySelector('.loading');
 
   
    receiverAddress.addEventListener('input', inputHandler);
    receiverNames.addEventListener('input', inputHandler);
    receiverPhone.addEventListener('input', inputHandler);
    weight.addEventListener('input', inputHandler);

    fromProvince.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value) {
        form.from_province = value;
        const districts = provinces[value].districts || []
  
        fromDistrict.options.length = 0; //Reset district option to 0
        fromDistrict.options[0] = new Option('Select District'); // Add the first option to district
  
        // Add all district from the selected province
        for(let index in districts) {
          fromDistrict.add(new Option(districts[index].name, index));
        };
      }
    });

    toProvince.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value) {
        form.to_province = value;
        const districts = provinces[value].districts || []
  
        toDistrict.options.length = 0; //Reset district option to 0
        toDistrict.options[0] = new Option('Select District'); // Add the first option to district
  
        // Add all district from the selected province
        for(let index in districts) {
          toDistrict.add(new Option(districts[index].name, index));
        };
      }
    });
  
    fromDistrict.addEventListener('change', (e) => {
      form.from_district = e.target.value
      renderDetails()
    });

    toDistrict.addEventListener('change', (e) => {
      form.to_district = e.target.value
      renderDetails()
    });

    submitForm.addEventListener('click', (e) => {
      e.preventDefault();
      loading.classList.add('active');
      
      if (validateInputs()) {
        setTimeout(() => loading.classList.remove('active'), 2000);
        return;
      }

      fetchAPI('/parcels', {method: 'post', body: { ...form } })
        .then((res) => {
          const { data } = res;
          if (res.message) {
            errorMessage.textContent = res.message;
          }
          if (data) {
            const title = 'Parcel created';
            const body = `
              <p>
                <b>From</b>: ${data.from_province}, ${data.from_district}<br>
                <b>To</b>: ${data.to_province}, ${data.to_district}<br> 
              </p>
            `
            model({
              title,
              body,
            });

            resentInputs();
            
            parcel = { ...data };
            // Wait for a second
            setTimeout(() => {
              // location.href = `/#/profile/${data.id}`;
            }, 1000);
          }

          // Wait for 2 seconds to smooth the spinner
          setTimeout(() => {
            loading.classList.remove('active');
          }, 2000);
        })
        .catch((err) => {
          loading.classList.remove('active');
          if (err.message) {
            errorMessage.textContent = err.message;
          }
        })
    });
    // Callback function to handle email and password imput
    function inputHandler (e) {
      form[e.target.id] = e.target.value;
      renderDetails() 
    }
    function renderDetails () {
      const price = getPrice(form.weight);
      form.price = price;
      quoteResult.innerHTML = `
      <p>
        From <strong>${form.from_district || '-'}</strong> 
        to <strong class="capitalize">${form.to_district || '-'}</strong>, a parcel of 
        <strong class="capitalize">${form.weight || '-'} Kg</strong> costs <strong>${price || '-'} RWF</strong>
      </p>`;
    }
    function validateInputs () {
      const keys = Object.keys(form);
      let hasError = false;
      keys.forEach(key => {
        if (!form[key] && form[key] !== 0) {
          document.querySelector(`.form-error.${key}`).textContent = 'Required'
          document.querySelector(`.form-error.${key}`).style.color = 'red'
          hasError = true;
        }
        // Set all null field to an empty string
        if (form[key] === null) {
          form[key] = '';
        }
      });
      return hasError;
    }

    function resentInputs () {
      const keys = Object.keys(form);
      let hasError = false;
      keys.forEach(key => {
        if (!form[key] && form[key] !== 0) {
          form[key] = ''
          document.querySelector(`#${key}`).textContent = ''
          // document.querySelector(`#form-error`). = 'red'
        }
      });
      return hasError;
    }
  }
 }
 
 export default Page;
 