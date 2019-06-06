window.addEventListener("load", function(e){
    // add click listener to add payment button
    (function (){
        var addDept_button = document.getElementById("addDept-button");
        addDept_button.addEventListener("click", function(){
            var formData = new FormData();

            var department_name =window.prompt("Please enter a department name");
            formData.append("department_name", department_name);
            var department_location = window.prompt("Please enter a department location");
            formData.append("department_location", department_location);

            inv_ajax.postAjax(
                submit_department_url, inv_ajax.get_csrf(), formData
            ).then(function(json){
                inv_department.build_departments();
            });
        });

        // Fills payments into table
        inv_department.build_departments();
    })();
},false);

var inv_department = {
     build_departments: function() {
        inv_ajax.getAjax(
            get_department_url, inv_ajax.get_csrf()
        ).then(function(departments_json){
            
            var dept_tbody = document.getElementById("department-tbody");
            var depts_obj = JSON.parse(departments_json);

            // Remove all child in tbody
            while (dept_tbody.firstChild) {
                dept_tbody.removeChild(dept_tbody.firstChild);
            }
            
            var deptnum = 0,
                department_name,
                department_location,
                dept_obj;

            var tr, th, th_text;

            for (var id in depts_obj) {
                dept_obj = depts_obj[id];

                department_name = dept_obj["name"];
                department_location = dept_obj["location"];
                tr = document.createElement("tr");

                // Dept Num TD
                th = document.createElement("td");
                th_text = document.createTextNode(++deptnum);
                th.appendChild(th_text);

                tr.appendChild(th);

                // Dept  ID
                th = document.createElement("td");
                th_text = document.createTextNode(id);
                th.appendChild(th_text);

                tr.appendChild(th);

                // Dept name TD
                th = document.createElement("td");
                th_text = document.createTextNode(department_name);
                th.appendChild(th_text);

                tr.appendChild(th);

                // Dept URL TD
                th = document.createElement("td");
                th_text = document.createTextNode(department_location);
                th.appendChild(th_text);

                tr.appendChild(th);

                dept_tbody.appendChild(tr);
            }
            
        });
    }
};