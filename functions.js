//zl_drug_list
function sdsd(obj) {
    let result = obj[0]
    let keys = Object.keys(result);
    if (!keys.find(key => key.startsWith('zl_DrugAdvice'))) {
        return [];
    }
    return keys.filter(key => key.startsWith('zl_DrugAdvice')).filter(key => result[key]).map(key => {
        return result[key]
    }).reduce((a, b) => a.concat(b))
}


