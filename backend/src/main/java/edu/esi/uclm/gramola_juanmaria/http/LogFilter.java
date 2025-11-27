package edu.esi.uclm.gramola_juanmaria.http;

import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import edu.esi.uclm.gramola_juanmaria.model.Log;
import edu.esi.uclm.gramola_juanmaria.dao.LogDao;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class LogFilter extends OncePerRequestFilter {

    @Autowired
    private LogDao logDao;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String url = request.getRequestURL().toString();
        String method = request.getMethod();
        String ip = request.getRemoteAddr();
        long time = System.currentTimeMillis();
        String userAgent = request.getHeader("User-Agent");
        String params = request.getQueryString();
        Log log = new Log(url, ip, method, userAgent, params, time);
        logDao.save(log);
        filterChain.doFilter(request, response);
    }

}
