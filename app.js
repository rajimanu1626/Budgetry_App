var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }


    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getpercentage = function () {
        return this.percentage;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    function calculateBudget(type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            //console.log(cur.description);
            sum += cur.value;
        });

        data.totals[type] = sum;

    }

    return {

        addItem: function (type, description, value) {
            var newItem, ID

            //To create a new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                //console.log(ID);
            } else {
                ID = 0;
            }


            //to create data with respect to 'inc' or 'exp'
            if (type === 'inc') {
                newItem = new Income(ID, description, value)
                //console.log(data.allItems);
            } else if (type === 'exp') {
                newItem = new Expense(ID, description, value)
            }

            //pushing data into similar objects
            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateBudget: function () {
            //1. calculate total income and expenses
            calculateBudget('exp');
            calculateBudget('inc');
            //2. calucate the budget: income-expense
            data.budget = data.totals.inc - data.totals.exp;
            //3.cal percentage of expense from income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else
                data.percentage = -1;

        },
        calculatePercentage: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);
            })
        },


        getPercentage: function () {

            var percentages = data.allItems.exp.map(function (curr) {
                return curr.getpercentage();
            })
            //console.log(percentages);
            return percentages;
        },

        getBudget: function () {
            return {

                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage


            }
        },

        removeItem: function (type, id) {
            var ids, index;
            //console.log(id);
            ids = data.allItems[type].map(function (curr) {
                console.log(curr.id);
                return curr.id;
            });
            console.log(ids);
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },


        test: function () {
            console.log(data.allItems);
        }
    }

})();


var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        intputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        eachPercLabel: '.item__percentage',
        month: '.budget__title--month'

    }

    function numberFormat(num, type) {
        var numSplit, int, dec
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        return (type === 'exp' ? '-' : '+') + int + '.' + dec;
    }

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++)
            callback(list[i], i) // this call back function calls (1)
    };


    return { //used to return all elements that is to be used globally or specifically by controller
        getInput: function () { //object 1
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.intputValue).value)
            }
        },

        getDOMstring: function () { //object 2
            return DOMstrings;
        },

        addUIItems: function (obj, type) {
            var html, newhtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%', numberFormat(obj.value, type));


            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);

        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.intputValue);
            //console.log(fields);
            fieldsArr = Array.prototype.slice.call(fields); // slice is a method which recieves an array and slices that array... Slice can only work for arrays.... so we gonna use prototype from arrays and using call we r gonna append it to the fucntion and then use slice
            //console.log(fieldsArr);
            fieldsArr.forEach(function (current, index, array) {
                //console.log(current.value);
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = numberFormat(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = numberFormat(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = numberFormat(obj.totalExp, 'exp');
            if (obj.percentage !== -1)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            else
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },

        displayPercentageEach: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.eachPercLabel)


            nodeListForEach(fields, function (current, index) { //(1) this function and this function is exectuded
                //console.log(percentages[index])
                if (percentages[index] > 0) {

                    current.textContent = percentages[index] + '%';
                } else
                    current.textContent = '---';

            })
        },

        displayDate: function () {
            var month, year, n;
            n = new Date();
            month = n.getMonth();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            month = months[month];
            year = n.getFullYear();
            document.querySelector(DOMstrings.month).textContent = month + ' ' + year;

        },
        changedType: function () {
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.intputValue);
            nodeListForEach(fields, function (curr) {
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')

        },

        removeUIItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentElement.removeChild(el);

        }

    }
})();


//Global Control of Budget and UI Controller

var controller = (function (budgetCntrl, UICtrl) {


    var setUpEventListners = function () {

        var DOM = UICtrl.getDOMstring(); //getting dom strings from UI controller

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    }


    var updateBudget = function () {
        //1. Calculate the budget
        budgetCntrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCntrl.getBudget();
        //console.log(budget);
        //3. Update the budget on the UI
        UICtrl.displayBudget(budget);



    };

    var updatePercentage = function () {
        //1.Calculate percentage
        budgetCntrl.calculatePercentage();
        //2.Read percentages from budget controller
        var percentages = budgetCntrl.getPercentage();
        //3. Display individual percent after DOM manuplating
        UICtrl.displayPercentageEach(percentages);


    }

    function ctrlAddItem() {
        //1.Get the input datas**************************************

        var input = UICtrl.getInput();

        if (input.description !== "" && input.value !== 0 && !isNaN(input.value)) {

            //2.Adding the item to budget controller*********************
            var newItem = budgetCntrl.addItem(input.type, input.description, input.value);

            //3.Adding and displaying element in the UI
            UICtrl.addUIItems(newItem, input.type);

            //4.clearing the input field
            UICtrl.clearFields();

            //5. Calculate and update the budget
            updateBudget();

            //6. Calulate and update percentages
            updatePercentage();

        }
    }

    function ctrlDeleteItem(event) {
        var itemID, splitID, type, ID;
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //console.log(splitID);
            budgetCntrl.removeItem(type, ID);
            UICtrl.removeUIItem(itemID);
            budgetCntrl.calculateBudget();
            updateBudget();
            updatePercentage();
        }
    }

    return {
        init: function () {
            console.log('App has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setUpEventListners();

        }
    }




})(budgetController, UIController);

controller.init(); //Uses to initialize the app!
