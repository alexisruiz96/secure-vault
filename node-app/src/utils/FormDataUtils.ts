export const checkAppendedFormData = (formData: FormData)  => {
    for (let element of formData.entries()) {
        console.log(element[0]+ ', ' + element[1]); 
    }
}