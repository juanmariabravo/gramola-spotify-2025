import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    if (req.url.indexOf('/users') !== -1) {
        return next(req);
    }
    const username = 'admin';
    const password = 'Administrador1234';

    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    const cloned = req.clone({
        setHeaders: {
            Authorization: authHeader
        }
    });

    return next(cloned);
};
