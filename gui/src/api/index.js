
function emit(msg, params = undefined){
  const p = params ? `(${params.join(',')})`:''
  return new Promise( (success, failure) => {
    const request = new Request( 'api', {
      method: 'POST',
      body: `{"what":"${msg}${p}"}`
    })

    fetch(request)
      .then( (response) => {
        if( response.status != 200){
          failure(response)
          return
        }

        return response.json()
      })
      .then((json) => {
        success(json)
      })
      .catch( (err) => {
        failure(err)
      })
  })

}

export default {
  emit
}
