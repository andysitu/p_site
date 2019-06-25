window.addEventListener("load", function(e){
    // add click listener to add payment button
    (function (){
        var addDept_button = document.getElementById("addDept-button");
        addDept_button.addEventListener("click", function(){
            var formData = new FormData();

            var correct_name = false,
                correct_location = false;
            var department_name =window.prompt("Please enter a department name");
            if (department_name && department_name.length <= 30) {
                formData.append("department_name", department_name);
                correct_name = true;
            }
            
            var department_location = window.prompt("Please enter a department location");
            if (department_location && department_location.length <= 50) {
                formData.append("department_location", department_location);
                correct_location = true;
            }

            formData.append("command", "create");
            
            if (correct_name && correct_location) {
                inv_ajax.postAjax(
                    submit_dept_url, inv_ajax.get_csrf(), formData
                ).then(function(json){
                    inv_department.build_departments();
                });
            } else {
                window.alert("Name and/or location was inputted incorrectly. Max length of 30/50.");
            }
            
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
                td = document.createElement("td");
                td_text = document.createTextNode(++deptnum);
                td.appendChild(td_text);

                tr.appendChild(td);

                // Dept  ID
                td = document.createElement("td");
                td_text = document.createTextNode(id);
                td.appendChild(td_text);

                tr.appendChild(td);

                // Dept name TD
                td = document.createElement("td");
                td_text = document.createTextNode(department_name);
                td.appendChild(td_text);

                tr.appendChild(td);

                // Dept URL TD
                td = document.createElement("td");
                td_text = document.createTextNode(department_location);
                td.appendChild(td_text);

                tr.appendChild(td);

                // Delete & Edit Button
                td = document.createElement("td");

                var edit_btn = document.createElement("button");
                edit_btn.classList.add("btn");
                edit_btn.classList.add("btn-secondary");
                edit_btn.append(document.createTextNode("Edit"));

                edit_btn.addEventListener("click", inv_department.edit_listener);

                edit_btn.setAttribute("id", "edit-btn-" + id);

                td.append(edit_btn);

                var del_btn = document.createElement("button");
                del_btn.classList.add("btn");
                del_btn.classList.add("btn-danger");
                del_btn.append(document.createTextNode("Delete"));

                del_btn.addEventListener("click", inv_department.delete_listener);

                del_btn.setAttribute("id", "del-btn-" + id);

                td.append(del_btn);

                tr.appendChild(td);

                dept_tbody.appendChild(tr);
            }
            
        });
    },
    delete_listener(e) {
        // Regedx to get id
        var re = /-(\d+)$/;
        // Save first captured string as ID
        var dept_id = re.exec(e.target.id)[1];

        var answer = window.confirm("Are you sure you want to delete ID#" + dept_id + "?");
        
        if (answer) {
            var fd = new FormData();
            fd.append("command", "delete");
            fd.append("id", dept_id);
            
            inv_ajax.postAjax(
                submit_department_url, inv_ajax.get_csrf(), fd
            ).then(function(json){
                window.location.reload();
            });
        }
    },
    edit_listener(e) {
        // Regedx to get id
        var re = /-(\d+)$/;
        // Save first captured string as ID
        var dept_id = re.exec(e.target.id)[1];

        var department = window.prompt("Department name? Leave blank for unchanged"),
            location = window.prompt("Location? Leave blank for Unchaged");

        var fd = new FormData();

        if (department)
            fd.append("department", department);
        if (location)
            fd.append("location", location);
        
        if (department || location) {
            fd.append("command", "edit");
            fd.append("id", dept_id);
            
            inv_ajax.postAjax(
                submit_department_url, inv_ajax.get_csrf(), fd
            ).then(function(json){
                window.location.reload();
            });
        }
    },
};