
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const itemsPerPage = localStorage.getItem('itemsPerPage') || '2';

    const paginationNums = document.getElementById('paginationNums');
    paginationNums.value = itemsPerPage ;

    paginationNums.addEventListener('change',async function() {
        const selectedValue = paginationNums.value;
        localStorage.setItem('itemsPerPage', selectedValue);
        await getExpenses()
      })

    displayPremiumStatus();
    await getExpenses()
  } catch (error) {
    console.error('Failed to load expenses or premium status:', error);
  }
});


async function displayExpenseOnScreen(expenseDetails) {
  try{   
    const parentElem = document.getElementById('expenseList');
      
    const listItem = document.createElement('li');
    listItem.textContent = `${expenseDetails.amount} - ${expenseDetails.description} - ${expenseDetails.category}`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/expenses/${expenseDetails._id}`,{headers:{"authorization":token}});
        parentElem.removeChild(listItem);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    };
    listItem.appendChild(deleteButton);
    parentElem.appendChild(listItem);
  }catch(err){
    console.log(err);
  }
}

const showpagination=async(data)=>{
  try{
    document.getElementById('expenseList').innerHTML='';
    const pagination=document.getElementById('expensePagination')
    pagination.innerHTML='';
    
    if (data.hasPreviousPage) {
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.addEventListener('click', () => getExpenses(data.previousPage));
      pagination.appendChild(prevButton);
    }

    const currentPageButton = document.createElement('button');
    currentPageButton.textContent = `Page ${data.currentPage}`;
    currentPageButton.disabled = true; 
    pagination.appendChild(currentPageButton);

    if (data.nextPage <= data.lastPage) {
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.addEventListener('click', () => getExpenses(data.nextPage));
      pagination.appendChild(nextButton);
    }
    }catch (err){
      console.log(err)
    }
}

const getExpenses=async(page=1)=>{
  try{
    const itemsPerPage = localStorage.getItem('itemsPerPage') || '2';
    const token = localStorage.getItem('token');
    const expensesResponse = await axios.get(`/expenses/get`, {
       params: { 
          page: page,
          itemsPerPage: itemsPerPage }, 
      headers: { "authorization": token },
    });
    
    showpagination(expensesResponse.data);
      expensesResponse.data.expenses.forEach(expenseDetails => {
        displayExpenseOnScreen(expenseDetails);
    });
    
    return expensesResponse;
  } catch (err){
    console.log(err)
  }
}

document.getElementById('form').addEventListener('submit' ,async(event)=> {
  event.preventDefault();

  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;

  const expenseObj = {
    amount: amount,
    description: description,
    category: category 
  };
  
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`/expenses/post`, expenseObj,{headers:{"authorization":token}});    
    displayExpenseOnScreen(response.data);
    event.target.reset();
  } catch (error) {
    console.error('Expense addition failed:', error);
  }
});

//dealing with premium membership

document.getElementById('rzp-button1').addEventListener('click' ,async function (e) {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`/purchase/premiummembership`, { headers: { "Authorization": token } });

    var options = {  
      "key": response.data.key_id,
      "order_id": response.data.order.id,
      "handler": async function (response) {
        try {
          const postResponse=await axios.post(`/purchase/updatetransactionstatus`, {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },
          { 
            headers: { "Authorization": token }
          });

          displayPremiumStatus();
          console.log(postResponse)
        } catch (error) {
          console.error('Error updating transaction status:', error);
        }
      }, 
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', async function (response) {
      try {
        console.log(response);
        await axios.post(`/purchase/updateFailedStatus`, {
          order_id: options.order_id,
        }, { headers: { "Authorization": token } });
        alert('Payment failed. Your order status has been updated.');
      } catch (error) {
        console.error('Error updating order status:', error);
        alert('Payment failed. Please contact support.');
      }
    });
  } catch (error) {
    console.error('Error initiating premium membership purchase:', error);
    alert('Failed to initiate premium membership purchase. Please try again.');
  }
});

const displayPremiumStatus = async()=> {
  try{
    const token = localStorage.getItem('token');
    const premiumStatusResponse = await axios.get(`/purchase/getStatus`, { headers: { "authorization": token } });
    const isPremium = premiumStatusResponse.data.status;
    const premiumTag=document.getElementById('successMessage');
    const lbHeading = document.getElementById('lbHeading'); 

    if(isPremium===true){
      document.getElementById('rzp-button1').style.display = 'none';
      premiumTag.innerHTML='You are a Premium User';

      displayRecoardsOnScreen();
      
      const lbButton = document.createElement('button');
      lbButton.textContent = 'Leader Board';
      lbButton.onclick = () => {
          leaderBoardFuction();
      };
      premiumTag.appendChild(lbButton)
    }else{
      document.getElementById('successMessage').innerHTML = 'You are not a Premium User';
      lbHeading.style.display = 'none';
      lbList.innerHTML = '';
    }
  } catch(err){
    console.log(err)
  }
}

const leaderBoardFuction=async()=>{
  try{
    const token = localStorage.getItem('token');
    const lbList = document.getElementById('lbList');
    const response = await axios.get(`/premium/leaderBoard`, { headers: { "Authorization": token } });
    
    lbList.innerHTML = '';
    response.data.forEach(user => {
      const listItem = document.createElement('li');
      listItem.textContent = `Name : ${user.username} - Total expenses : ${user.totalExpense}`;
      lbList.appendChild(listItem);
    });
    lbHeading.style.display = 'block';
  } catch(err) {
    console.log(err);
    alert(err.response.data.message)
  }
}


async function download(){
  try{
    const token = localStorage.getItem('token');
    const response=await axios.get(`/premium/download`, { headers: {"Authorization" : token} })
    if(response.status === 201){
        let a = document.createElement("a");
        a.href = response.data.Location;
        a.download = 'myexpense.csv';
        a.click();
    }
    displayRecoardsOnScreen();
  }catch(err){
    console.log(err.response.data.message)
    alert(err.response.data.message)
    throw new Error(err)
  }
}



async function displayRecoardsOnScreen() {
  try{
    DRecoardsDiv.style.display = 'block';
    const token = localStorage.getItem('token');
    const DRecoard=await axios.get(`/premium/downloadRecoard`, { headers: {"Authorization" : token} })
    document.getElementById('DRecoards').innerHTML="";

    DRecoard.data.forEach(DRecoards => {
      const parentElem = document.getElementById('DRecoards');
      const listItem = document.createElement('li');
      listItem.textContent = `${DRecoards.downloadedAt}  `;

      const downloadLink = document.createElement('a');
      downloadLink.href = DRecoards.url;
      downloadLink.textContent = 'Download';
      downloadLink.download = 'myexpense.csv'; 

      listItem.appendChild(downloadLink);
      parentElem.appendChild(listItem);
    });  
  } catch(err){
    console.log(err);
    alert('err')
  }
}
